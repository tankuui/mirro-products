import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: "任务不存在" },
        { status: 404 }
      );
    }

    const { data: images, error: imagesError } = await supabase
      .from("image_records")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (imagesError) {
      console.error("获取图片记录失败:", imagesError);
    }

    const { data: logs, error: logsError } = await supabase
      .from("task_logs")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (logsError) {
      console.error("获取日志失败:", logsError);
    }

    return NextResponse.json({
      task,
      images: images || [],
      logs: logs || [],
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
