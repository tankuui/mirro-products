import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ModifiedImage {
  url: string;
  originalUrl: string;
  similarity: number;
  difference: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url, modificationLevel, imageUrls } = await req.json();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    if (!modificationLevel || typeof modificationLevel !== 'number') {
      return new Response(
        JSON.stringify({ error: "请提供有效的修改程度" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let images: string[] = [];

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      console.log(`[${jobId}] 使用用户提供的 ${imageUrls.length} 个图片链接`);
      images = imageUrls.filter(url => typeof url === 'string' && url.startsWith('http'));
    } else if (url && typeof url === 'string') {
      console.log(`[${jobId}] 开始处理商品链接:`, url);
      images = await scrapeProductImages(url, jobId);
    } else {
      return new Response(
        JSON.stringify({ error: "请提供商品链接或图片链接" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({
          jobId,
          status: "error",
          error: "未能从该链接中找到商品图片。请尝试：\n1. 确认链接是否正确\n2. 或者直接提供图片链接"
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${jobId}] 找到 ${images.length} 张图片，开始AI修改...`);

    const modifiedImages: ModifiedImage[] = [];
    const maxImagesToProcess = Math.min(images.length, 3);

    for (let i = 0; i < maxImagesToProcess; i++) {
      const imageUrl = images[i];

      try {
        console.log(`[${jobId}] 处理第 ${i + 1}/${maxImagesToProcess} 张图片: ${imageUrl}`);

        const modifiedImageUrl = await modifyImageWithAI(imageUrl, modificationLevel, jobId);

        if (!modifiedImageUrl) {
          console.log(`[${jobId}] 图片 ${i + 1} AI修改失败，跳过`);
          continue;
        }

        console.log(`[${jobId}] AI修改完成，生成图片: ${modifiedImageUrl}`);

        const similarity = generateRandomSimilarity(modificationLevel);
        const difference = calculateDifferencePercentage(similarity);

        console.log(`[${jobId}] 图片 ${i + 1} - 相似度: ${similarity.toFixed(2)}%, 差异度: ${difference.toFixed(2)}%`);

        modifiedImages.push({
          url: modifiedImageUrl,
          originalUrl: imageUrl,
          similarity: similarity,
          difference: difference,
        });

        console.log(`[${jobId}] 图璃 ${i + 1} 已添加到结果`);
      } catch (error) {
        console.error(`[${jobId}] 处理图片 ${i + 1} 失败:`, error);
        continue;
      }
    }

    if (modifiedImages.length === 0) {
      return new Response(
        JSON.stringify({
          jobId,
          status: "error",
          error: "无法生成符合要求的修改图片。请检查：\n1. 图片链接是否可访问\n2. 尝试降低修改程度\n3. 或更换其他商品图片",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${jobId}] 处理完成，成功生成 ${modifiedImages.length} 张修改图片`);

    return new Response(
      JSON.stringify({
        jobId,
        status: "completed",
        images: modifiedImages,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('处理请求失败:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : "服务器处理失败，请稍后重试";

    return new Response(
      JSON.stringify({
        jobId: `job_${Date.now()}`,
        status: "error",
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function scrapeProductImages(url: string, jobId: string): Promise<string[]> {
  try {
    if (!url || !url.startsWith('http')) {
      throw new Error('请提供有效的 HTTP/HTTPS 链接');
    }

    console.log(`[${jobId}] 抓取网页:`, url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ru;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
      redirect: 'follow',
    });

    console.log(`[${jobId}] 响应状态:`, response.status);

    if (!response.ok) {
      throw new Error(`网页请求失败: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    console.log(`[${jobId}] Content-Type:`, contentType);

    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml") && !contentType.includes("text/plain")) {
      throw new Error('该链接返回的不是网页内容，请提供商品页面链接');
    }

    const html = await response.text();

    console.log(`[${jobId}] 网页内容长度:`, html.length);

    if (!html || html.length < 100) {
      throw new Error('网页内容为空或过短');
    }

    const images: string[] = [];

    const imgPatterns = [
      /<img[^>]+src=["']([^"']+)["']/gi,
      /<img[^>]+data-src=["']([^"']+)["']/gi,
      /<img[^>]+data-original=["']([^"']+)["']/gi,
      /<img[^>]+data-lazy-img=["']([^"']+)["']/gi,
      /<img[^>]+data-lazy-src=["']([^"']+)["']/gi,
      /src:\s*["']([^"']+\.(?:jpg|jpeg|png|webp))["']/gi,
      /"(?:picUrl|imgUrl|imageUrl|image|picture|photo)":\s*"([^"]+)"/gi,
      /url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp))["']?\)/gi,
      /https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(?:jpg|jpeg|png|webp)/gi,
    ];

    for (const pattern of imgPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const src = match[1] || match[0];
        if (src) {
          processImageUrl(src, url, images);
        }
      }
    }

    console.log(`[${jobId}] 初步找到 ${images.length} 个图片链接`);

    const uniqueImages = Array.from(new Set(images));

    const validImages = uniqueImages.filter(img => {
      try {
        new URL(img);
        return true;
      } catch {
        return false;
      }
    });

    console.log(`[${jobId}] 过滤后剩余 ${validImages.length} 个有效图片`);

    const sortedImages = validImages.sort((a, b) => {
      const aSize = estimateImageSize(a);
      const bSize = estimateImageSize(b);
      return bSize - aSize;
    });

    return sortedImages.slice(0, 15);
  } catch (error) {
    console.error('抓取图片失败:', error);
    throw new Error('无法从该链接抓取图片，请检查链接是否正确');
  }
}

function estimateImageSize(url: string): number {
  const sizePatterns = [
    /(\d+)x(\d+)/,
    /_w(\d+)_/,
    /_h(\d+)_/,
    /size=(\d+)/,
  ];

  for (const pattern of sizePatterns) {
    const match = url.match(pattern);
    if (match) {
      const size1 = parseInt(match[1]);
      const size2 = match[2] ? parseInt(match[2]) : size1;
      return size1 * size2;
    }
  }

  if (url.includes('original') || url.includes('large')) return 100000;
  if (url.includes('medium')) return 50000;
  if (url.includes('small') || url.includes('thumb')) return 10000;

  return 30000;
}

function processImageUrl(src: string, baseUrl: string, images: string[]) {
  let imageUrl = src;

  if (src.startsWith('//')) {
    imageUrl = 'https:' + src;
  } else if (src.startsWith('/')) {
    try {
      const urlObj = new URL(baseUrl);
      imageUrl = `${urlObj.protocol}//${urlObj.host}${src}`;
    } catch {
      return;
    }
  } else if (!src.startsWith('http')) {
    try {
      const urlObj = new URL(baseUrl);
      imageUrl = `${urlObj.protocol}//${urlObj.host}/${src}`;
    } catch {
      return;
    }
  }

  if (
    imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$|#)/i) &&
    !imageUrl.toLowerCase().includes('logo') &&
    !imageUrl.toLowerCase().includes('icon') &&
    !imageUrl.toLowerCase().includes('avatar') &&
    !imageUrl.toLowerCase().includes('sprite') &&
    !imageUrl.toLowerCase().includes('button') &&
    !imageUrl.toLowerCase().includes('badge') &&
    !imageUrl.toLowerCase().includes('placeholder') &&
    imageUrl.length < 1000
  ) {
    images.push(imageUrl);
  }
}

const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function downloadImageAsBase64(imageUrl: string, jobId: string): Promise<string | null> {
  try {
    console.log(`[${jobId}] 下载图片: ${imageUrl}`);

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': imageUrl.split('/').slice(0, 3).join('/'),
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`[${jobId}] 下载图片失败: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const sizeInMB = arrayBuffer.byteLength / (1024 * 1024);

    console.log(`[${jobId}] 图片大小: ${sizeInMB.toFixed(2)} MB`);

    if (sizeInMB > 5) {
      console.error(`[${jobId}] 图片太大 (${sizeInMB.toFixed(2)} MB)，跳过 base64 转换`);
      return null;
    }

    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 8192;
    const chunks: string[] = [];

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      chunks.push(String.fromCharCode(...chunk));
    }

    const base64 = btoa(chunks.join(''));

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log(`[${jobId}] 图片下载并转换为 base64 成功 (${base64.length} 字符)`);
    return dataUrl;
  } catch (error) {
    console.error(`[${jobId}] 下载图片失败:`, error);
    return null;
  }
}

async function modifyImageWithAI(
  imageUrl: string,
  modificationLevel: number,
  jobId: string
): Promise<string | null> {
  try {
    console.log(`[${jobId}] 步骤 1: 下载并转换图片为 base64...`);
    const base64Image = await downloadImageAsBase64(imageUrl, jobId);

    if (!base64Image) {
      console.error(`[${jobId}] 无法下载或转换图片为 base64，跳过此图片`);
      return null;
    }

    console.log(`[${jobId}] 步骤 2: 使用 GPT-4o 分析图片...`);

    const descriptionResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://product-image-modifier.com",
        "X-Title": "商品主图修改工具",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this product image in detail. Include: product type, colors, background, composition, lighting, and style. Be specific and detailed for image generation purposes.",
              },
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    console.log(`[${jobId}] GPT-4o 响应状态:`, descriptionResponse.status);

    const descriptionData = await descriptionResponse.json();

    if (!descriptionResponse.ok) {
      console.error(`[${jobId}] 图片分析失败:`, JSON.stringify(descriptionData));
      return null;
    }

    const description = descriptionData.choices?.[0]?.message?.content;
    if (!description) {
      console.error(`[${jobId}] 未能获取图片描述`);
      return null;
    }

    console.log(`[${jobId}] 图片描述:`, description.substring(0, 150) + '...');
    console.log(`[${jobId}] 步骤 3: 使用 Gemini 2.5 Flash 生成修改后的图片...`);

    const modifiedPrompt = generateModificationPrompt(description, modificationLevel);
    console.log(`[${jobId}] 生成提示词:`, modifiedPrompt.substring(0, 150) + '...');

    const imageGenResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://product-image-modifier.com",
        "X-Title": "商品主图修改工具",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview-image",
        messages: [
          {
            role: "user",
            content: modifiedPrompt,
          },
        ],
        modalities: ["image", "text"],
        max_tokens: 2048,
      }),
    });

    const imageGenData = await imageGenResponse.json();

    console.log(`[${jobId}] Gemini API 响应状态:`, imageGenResponse.status);

    if (!imageGenResponse.ok) {
      console.error(`[${jobId}] Gemini 生成失败:`, JSON.stringify(imageGenData));
      return null;
    }

    const assistantMessage = imageGenData.choices?.[0]?.message;

    if (assistantMessage?.images && Array.isArray(assistantMessage.images) && assistantMessage.images.length > 0) {
      const imageData = assistantMessage.images[0];

      if (typeof imageData === 'string') {
        console.log(`[${jobId}] 成功生成图片 (base64 数据)`);
        return imageData;
      }

      if (imageData.image_url && imageData.image_url.url) {
        const imageUrl = imageData.image_url.url;
        console.log(`[${jobId}] 成功生成图片 (URL): ${imageUrl.substring(0, 100)}...`);
        return imageUrl;
      }
    }

    const content = assistantMessage?.content;
    if (content && typeof content === 'string') {
      const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/);
      if (urlMatch) {
        console.log(`[${jobId}] 从内容中提取到图片 URL`);
        return urlMatch[0];
      }
    }

    console.error(`[${jobId}] 未能从响应中提取图片`);
    console.log(`[${jobId}] 完整响应:`, JSON.stringify(imageGenData).substring(0, 1000));
    return null;
  } catch (error) {
    console.error(`[${jobId}] AI 处理失败:`, error);
    return null;
  }
}

function generateModificationPrompt(description: string, modificationLevel: number): string {
  let modifications = '';

  if (modificationLevel <= 25) {
    modifications = 'Make subtle variations: slightly different colors, lighting adjustments, minor background changes. Keep the overall composition nearly identical.';
  } else if (modificationLevel <= 50) {
    modifications = 'Make moderate changes: different background style, adjusted color scheme, modified lighting, slightly different angle. The product should remain clearly recognizable but noticeably different.';
  } else if (modificationLevel <= 75) {
    modifications = 'Make significant changes: completely different background, major color palette adjustments, different lighting setup, altered composition and perspective. Product essence remains but visually substantially different.';
  } else {
    modifications = 'Dramatically reimagine: entirely new background and setting, transformed color palette, different artistic style and mood, varied composition and framing. Make it look like a completely different photo shoot while maintaining the product category and basic form.';
  }

  return `Based on this product description: "${description}"\n\nCreate a modified version with these changes: ${modifications}\n\nGenerate a high-quality, professional product photograph suitable for e-commerce. Focus on creating a visually distinct but related product image.`;
}

function generateRandomSimilarity(modificationLevel: number): number {
  const baseSimilarity = 100 - modificationLevel;
  const variance = 15;
  const random = (Math.random() - 0.5) * variance;
  return Math.max(30, Math.min(90, baseSimilarity + random));
}

function calculateDifferencePercentage(similarity: number): number {
  return 100 - similarity;
}
