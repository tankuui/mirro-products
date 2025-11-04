import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '24h';
    const category = searchParams.get('category');

    let startTime: Date;
    const endTime = new Date();

    switch (period) {
      case '1h':
        startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    }

    const { data: images, error: imagesError } = await supabase
      .from('image_records')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .lt('created_at', endTime.toISOString());

    if (imagesError) {
      throw imagesError;
    }

    if (!images || images.length === 0) {
      return NextResponse.json({
        period,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalImages: 0,
        passedCount: 0,
        p0Count: 0,
        p1Count: 0,
        p2Count: 0,
        passRate: 0,
        p0Rate: 0,
        p1Rate: 0,
        avgSSIM: 0,
        avgPhashDistance: 0,
        avgEdgeScore: 0,
        avgGeomDelta: 0,
        retryRate: 0,
        errorsByType: {},
        targets: {
          p0RateTarget: 1.0,
          totalFailRateStage1: 5.0,
          totalFailRateStage2: 3.0,
          p0RateMature: 0.5,
        },
      });
    }

    const totalImages = images.length;

    const qualityDetailsArray = images.map(img => img.quality_details || {});
    const passedCount = qualityDetailsArray.filter(qd => qd.final_severity === 'OK').length;
    const p0Count = qualityDetailsArray.filter(qd => qd.final_severity === 'P0').length;
    const p1Count = qualityDetailsArray.filter(qd => qd.final_severity === 'P1').length;
    const p2Count = qualityDetailsArray.filter(qd => qd.final_severity === 'P2').length;

    const passRate = totalImages > 0 ? passedCount / totalImages : 0;
    const p0Rate = totalImages > 0 ? p0Count / totalImages : 0;
    const p1Rate = totalImages > 0 ? p1Count / totalImages : 0;

    const avgSSIM = qualityDetailsArray.reduce((sum, qd) => sum + (qd.ssim_score || 0), 0) / Math.max(1, totalImages);
    const avgPhashDistance = qualityDetailsArray.reduce((sum, qd) => sum + (qd.phash_distance || 0), 0) / Math.max(1, totalImages);
    const avgEdgeScore = qualityDetailsArray.reduce((sum, qd) => sum + (qd.edge_score || 0), 0) / Math.max(1, totalImages);
    const avgGeomDelta = qualityDetailsArray.reduce((sum, qd) => sum + (qd.geom_delta || 0), 0) / Math.max(1, totalImages);

    const retriedImages = images.filter(img => (img.regeneration_count || 0) > 0).length;
    const retryRate = totalImages > 0 ? retriedImages / totalImages : 0;

    const errorsByType: Record<string, number> = {};
    qualityDetailsArray.forEach(qd => {
      if (qd.error_reasons && Array.isArray(qd.error_reasons)) {
        qd.error_reasons.forEach((reason: string) => {
          errorsByType[reason] = (errorsByType[reason] || 0) + 1;
        });
      }
    });

    return NextResponse.json({
      period,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalImages,
      passedCount,
      p0Count,
      p1Count,
      p2Count,
      passRate: Math.round(passRate * 10000) / 100,
      p0Rate: Math.round(p0Rate * 10000) / 100,
      p1Rate: Math.round(p1Rate * 10000) / 100,
      avgSSIM: Math.round(avgSSIM * 1000) / 1000,
      avgPhashDistance: Math.round(avgPhashDistance * 10) / 10,
      avgEdgeScore: Math.round(avgEdgeScore * 1000) / 1000,
      avgGeomDelta: Math.round(avgGeomDelta * 1000) / 1000,
      retryRate: Math.round(retryRate * 10000) / 100,
      errorsByType,
      targets: {
        p0RateTarget: 1.0,
        totalFailRateStage1: 5.0,
        totalFailRateStage2: 3.0,
        p0RateMature: 0.5,
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
