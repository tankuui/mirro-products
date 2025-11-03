import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productUrl, productTitle, images, description, userId = "anonymous" } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "图片URL列表不能为空" },
        { status: 400 }
      );
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        product_url: productUrl,
        product_title: productTitle,
        original_description: description,
        status: "pending",
        total_images: images.length,
        processed_images: 0,
        progress: 0,
        current_step: "等待处理",
      })
      .select()
      .single();

    if (taskError) {
      console.error("创建任务失败:", taskError);
      return NextResponse.json(
        { error: "创建任务失败" },
        { status: 500 }
      );
    }

    const imageRecords = images.map((url: string) => ({
      task_id: task.id,
      original_url: url,
      status: "pending",
    }));

    const { error: imagesError } = await supabase
      .from("image_records")
      .insert(imageRecords);

    if (imagesError) {
      console.error("创建图片记录失败:", imagesError);
      await supabase.from("tasks").delete().eq("id", task.id);
      return NextResponse.json(
        { error: "创建图片记录失败" },
        { status: 500 }
      );
    }

    await supabase.from("task_logs").insert({
      task_id: task.id,
      log_type: "info",
      message: "任务已创建",
      metadata: { total_images: images.length },
    });

    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-task`;

    fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ taskId: task.id }),
    }).catch((err) => {
      console.error("触发Edge Function失败:", err);
    });

    return NextResponse.json({
      taskId: task.id,
      status: "pending",
      message: "任务已创建，正在后台处理",
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
