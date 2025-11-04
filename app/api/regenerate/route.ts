import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageRecordId, taskId, customPrompt } = body;

    if (!imageRecordId || !taskId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const { data: imageRecord, error: fetchError } = await supabase
      .from('image_records')
      .select('*')
      .eq('id', imageRecordId)
      .single();

    if (fetchError || !imageRecord) {
      return NextResponse.json(
        { error: '图片记录不存在' },
        { status: 404 }
      );
    }

    const { data: review } = await supabase
      .from('human_reviews')
      .select('*')
      .eq('image_record_id', imageRecordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const errorTypes = review?.error_types || [];

    let strategy = 'balanced';
    let model = 'google/gemini-2.5-flash-preview-image';
    let strengthAdjustment = 0;

    if (errorTypes.includes('product_shape_changed') ||
        errorTypes.includes('product_color_changed') ||
        errorTypes.includes('product_size_wrong')) {
      strategy = 'conservative';
      model = 'google/gemini-2.5-flash-preview-image';
      strengthAdjustment = -0.2;
    } else if (errorTypes.includes('background_insufficient')) {
      strategy = 'aggressive';
      strengthAdjustment = 0.2;
    } else if (errorTypes.includes('text_missing') || errorTypes.includes('logo_not_removed')) {
      strategy = 'text_protection';
      model = 'openai/gpt-4o';
    }

    const attemptNumber = (imageRecord.regeneration_count || 0) + 1;

    await supabase
      .from('regeneration_attempts')
      .insert({
        image_record_id: imageRecordId,
        human_review_id: review?.id || null,
        attempt_number: attemptNumber,
        strategy_used: customPrompt ? 'custom' : strategy,
        prompt_template: customPrompt || null,
        model_used: model,
        parameters: {
          strength_adjustment: strengthAdjustment,
          error_types: errorTypes,
          custom_prompt: customPrompt || null
        },
        created_at: new Date().toISOString()
      });

    await supabase
      .from('image_records')
      .update({
        status: 'pending',
        regeneration_count: attemptNumber,
        user_feedback_status: 'regenerating'
      })
      .eq('id', imageRecordId);

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/modify-images`;

    setTimeout(async () => {
      try {
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrls: [imageRecord.original_url],
            modificationLevel: 100 + (strengthAdjustment * 100),
            strategy: customPrompt ? 'custom' : strategy,
            model,
            regeneration: true,
            customPrompt: customPrompt || null
          })
        });

        if (response.ok) {
          const result = await response.json();

          if (result.images && result.images.length > 0) {
            await supabase
              .from('image_records')
              .update({
                modified_url: result.images[0].url,
                status: 'completed',
                user_feedback_status: 'pending',
                similarity: result.images[0].similarity,
                difference: result.images[0].difference
              })
              .eq('id', imageRecordId);

            await supabase
              .from('regeneration_attempts')
              .update({
                generated_url: result.images[0].url,
                success: true
              })
              .eq('image_record_id', imageRecordId)
              .eq('attempt_number', attemptNumber);
          }
        }
      } catch (error) {
        console.error('重新生成失败:', error);

        await supabase
          .from('image_records')
          .update({
            status: 'failed',
            user_feedback_status: 'fail',
            error_message: '重新生成失败'
          })
          .eq('id', imageRecordId);

        await supabase
          .from('regeneration_attempts')
          .update({
            success: false,
            error_message: error instanceof Error ? error.message : '未知错误'
          })
          .eq('image_record_id', imageRecordId)
          .eq('attempt_number', attemptNumber);
      }
    }, 100);

    return NextResponse.json({
      success: true,
      message: '已开始重新生成',
      attemptNumber
    });
  } catch (error) {
    console.error('启动重新生成失败:', error);
    return NextResponse.json(
      { error: '启动重新生成失败' },
      { status: 500 }
    );
  }
}
