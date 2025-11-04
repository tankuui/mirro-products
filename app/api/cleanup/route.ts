import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { days = 30 } = await request.json();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: oldImages, error: fetchError } = await supabase
      .from('image_records')
      .select('id, storage_path')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!oldImages || oldImages.length === 0) {
      return NextResponse.json({
        success: true,
        message: `没有找到 ${days} 天前的图片`,
        deleted: 0,
      });
    }

    const imageIds = oldImages.map((img) => img.id);

    const { error: deleteError } = await supabase
      .from('image_records')
      .delete()
      .in('id', imageIds);

    if (deleteError) {
      throw deleteError;
    }

    const storageDeletePromises = oldImages
      .filter((img) => img.storage_path)
      .map(async (img) => {
        try {
          await supabase.storage.from('product-images').remove([img.storage_path]);
        } catch (err) {
          console.error(`删除存储文件失败: ${img.storage_path}`, err);
        }
      });

    await Promise.allSettled(storageDeletePromises);

    return NextResponse.json({
      success: true,
      message: `成功删除 ${imageIds.length} 张旧图片`,
      deleted: imageIds.length,
      days,
    });
  } catch (error) {
    console.error('清理数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '清理数据失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { count: total, error: totalError } = await supabase
      .from('image_records')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: old, error: oldError } = await supabase
      .from('image_records')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (oldError) throw oldError;

    return NextResponse.json({
      total: total || 0,
      oldImages: old || 0,
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json(
      {
        error: '获取统计信息失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
