const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterMessage {
  role: string;
  content: Array<{
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function modifyImageWithAI(
  imageUrl: string,
  modificationLevel: number
): Promise<string> {
  const prompt = generatePrompt(modificationLevel);

  const messages: OpenRouterMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
          },
        },
      ],
    },
  ];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://product-image-modifier.com",
        "X-Title": "商品主图修改工具",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-image",
        messages,
        temperature: 0.7 + (modificationLevel / 200),
      }),
    });

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("OpenRouter 返回非 JSON 响应:", textResponse.substring(0, 200));
      throw new Error("OpenRouter API 返回了无效的响应格式，请稍后重试");
    }

    let data: OpenRouterResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("JSON 解析失败:", parseError);
      throw new Error("无法解析 API 响应，请稍后重试");
    }

    if (!response.ok) {
      const errorMsg = (data as any).error?.message || response.statusText;
      throw new Error(`OpenRouter API 错误: ${errorMsg}`);
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenRouter 响应数据:", JSON.stringify(data).substring(0, 200));
      throw new Error("AI 未返回有效内容");
    }

    const imageUrlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|webp|gif)/i);

    if (imageUrlMatch) {
      return imageUrlMatch[0];
    }

    const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/);
    if (urlMatch) {
      return urlMatch[0];
    }

    throw new Error("AI 响应中未找到有效的图片链接");
  } catch (error) {
    console.error("OpenRouter API 调用失败:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("AI 图片生成失败，请稍后重试");
  }
}

function generatePrompt(modificationLevel: number): string {
  if (modificationLevel <= 25) {
    return `Generate a slightly modified version of this product image. Make subtle changes to colors, lighting, or background while keeping the product clearly recognizable. Aim for about ${modificationLevel}% visual difference. Return only the image URL.`;
  } else if (modificationLevel <= 50) {
    return `Generate a moderately modified version of this product image. Change the background, adjust colors and lighting significantly, or modify the angle slightly. The product should still be recognizable but with noticeable differences. Aim for about ${modificationLevel}% visual difference. Return only the image URL.`;
  } else if (modificationLevel <= 75) {
    return `Generate a significantly modified version of this product image. Make major changes to background, colors, lighting, styling, and potentially the angle or composition. The product essence should remain but with substantial visual differences. Aim for about ${modificationLevel}% visual difference. Return only the image URL.`;
  } else {
    return `Generate a completely reimagined version of this product image. Transform the background, colors, style, composition, and presentation dramatically while maintaining the product category and basic function. Make it look like a different photo shoot. Aim for about ${modificationLevel}% visual difference. Return only the image URL.`;
  }
}
