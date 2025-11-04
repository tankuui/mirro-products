import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageRecordId, taskId, status, errorTypes, detailedFeedback, severity } = body;

    if (!imageRecordId || !taskId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from('human_reviews')
      .insert({
        image_record_id: imageRecordId,
        task_id: taskId,
        status: status || 'fail',
        error_types: errorTypes || [],
        severity: severity || 'OK',
        detailed_feedback: detailedFeedback || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reviewError) {
      console.error('创建反馈失败:', reviewError);
      return NextResponse.json(
        { error: '创建反馈失败' },
        { status: 500 }
      );
    }

    await supabase
      .from('image_records')
      .update({
        user_feedback_status: status
      })
      .eq('id', imageRecordId);

    if (errorTypes && errorTypes.length > 0) {
      for (const errorType of errorTypes) {
        const { data: existingPattern } = await supabase
          .from('error_patterns')
          .select('*')
          .eq('error_type', errorType)
          .single();

        if (existingPattern) {
          await supabase
            .from('error_patterns')
            .update({
              occurrence_count: existingPattern.occurrence_count + 1,
              last_occurred_at: new Date().toISOString(),
            })
            .eq('id', existingPattern.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('处理反馈失败:', error);
    return NextResponse.json(
      { error: '处理反馈失败' },
      { status: 500 }
    );
  }
}
