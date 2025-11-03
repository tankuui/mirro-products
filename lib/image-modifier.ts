const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

interface ModifiedImage {
  url: string;
  originalUrl: string;
  similarity: number;
  difference: number;
}

async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    console.log("Converting image to base64...");
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        console.log("Image converted to base64, length:", base64.length);
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    throw error;
  }
}

export async function modifyImageWithAI(
  imageUrl: string,
  modificationLevel: number,
  logoText: string = ""
): Promise<ModifiedImage[]> {
  return modifySingleImage(imageUrl, modificationLevel, logoText);
}

export async function modifyMultipleImages(
  imageFiles: File[],
  modificationLevel: number,
  logoText: string = "",
  onProgress?: (current: number, total: number, currentFile: string) => void
): Promise<ModifiedImage[]> {
  const results: ModifiedImage[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];

    if (onProgress) {
      onProgress(i + 1, imageFiles.length, file.name);
    }

    try {
      const base64Image = await fileToBase64(file);
      const modifiedImages = await modifySingleImageFromBase64(base64Image, modificationLevel, logoText, file.name);
      results.push(...modifiedImages);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      throw new Error(`处理图片 "${file.name}" 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  return results;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function modifySingleImage(
  imageUrl: string,
  modificationLevel: number,
  logoText: string = ""
): Promise<ModifiedImage[]> {
  try {
    console.log("Step 1: Converting image to base64...");
    const base64Image = await convertImageToBase64(imageUrl);

    console.log("Step 2: Analyzing image with GPT-4o...");

    const descriptionResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Product Image Modifier",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this product image in extreme detail. This image may contain text in ANY language (Chinese, Russian, English, etc.) and may have complex layouts with information panels.\n\n1. IMAGE LAYOUT:\n   - Describe the overall layout (product photo only, or product + information panel)\n   - If there's an information panel (left/right/top/bottom), note its position and color\n   - Note exact image dimensions\n\n2. PRODUCT PHYSICAL DETAILS (most important):\n   - Exact product type (vacuum cleaner, bottle, box, appliance, etc.)\n   - Precise shape and form\n   - Material appearance (plastic, metal, glass, stainless steel, etc.)\n   - Colors and design elements\n   - Size and proportions\n\n3. ALL TEXT IN IMAGE (CRITICAL - in ANY language):\n   ⚠️ IMPORTANT: Identify and list ALL text, regardless of language (Chinese, Russian, English, etc.)\n   \n   Categorize each text element as:\n   A) BRAND NAME/LOGO: Company names, brand logos, trademark symbols\n      Examples: \"Nike\", \"Adidas\", \"Янцзы\" (brand name)\n   \n   B) PRODUCT FEATURES/SELLING POINTS: All descriptive text about the product\n      Examples: \"防水\" (waterproof), \"1500W большая мощность\" (1500W high power)\n      \"18L емкость\" (18L capacity), \"Нержавеющая сталь\" (stainless steel)\n   \n   C) SPECIFICATIONS/INFO: Technical details, measurements, instructions\n   \n   For EACH text element, note:\n   - The exact text (in original language)\n   - Its category (A/B/C)\n   - Its location on the image\n   - Font size and style\n\n4. BACKGROUND:\n   - Background type and colors\n   - Lighting direction\n\nIMPORTANT: List ALL text visible in the image, preserving the original language. We need to distinguish brand names from product features.",
              },
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ],
          },
        ],
        max_tokens: 1200,
      }),
    });

    if (!descriptionResponse.ok) {
      const errorData = await descriptionResponse.json();
      throw new Error(`图片分析失败: ${errorData.error?.message || '未知错误'}`);
    }

    const descriptionData = await descriptionResponse.json();
    const description = descriptionData.choices?.[0]?.message?.content;

    if (!description) {
      throw new Error("未能获取图片描述");
    }

    console.log("Image description:", description.substring(0, 100) + "...");
    console.log("Step 3: Generating modified image with Gemini...");

    const modifiedPrompt = generateModificationPrompt(description, modificationLevel, logoText);
    console.log("Generated prompt:", modifiedPrompt.substring(0, 100) + "...");

    const numImages = Math.min(3, Math.max(1, Math.floor(modificationLevel / 30)));

    console.log("Sending image generation request with model: google/gemini-2.5-flash-preview-image");

    const imageGenResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Product Image Modifier",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: modifiedPrompt,
              },
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
        max_tokens: 2048,
      }),
    });

    console.log("Image generation response status:", imageGenResponse.status);

    if (!imageGenResponse.ok) {
      const errorText = await imageGenResponse.text();
      console.error("Image generation failed. Status:", imageGenResponse.status);
      console.error("Error response:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`图片生成失败 (${imageGenResponse.status}): ${errorData.error?.message || errorText.substring(0, 200)}`);
      } catch (e) {
        throw new Error(`图片生成失败 (${imageGenResponse.status}): ${errorText.substring(0, 200)}`);
      }
    }

    const imageGenData = await imageGenResponse.json();
    console.log("Image generation response keys:", Object.keys(imageGenData));
    console.log("Full image generation response:", JSON.stringify(imageGenData, null, 2).substring(0, 1000));

    const assistantMessage = imageGenData.choices?.[0]?.message;
    console.log("Assistant message:", assistantMessage);

    let generatedImageUrl: string | null = null;

    // Method 1: Check for images array in message
    if (assistantMessage?.images && Array.isArray(assistantMessage.images) && assistantMessage.images.length > 0) {
      console.log("Found images array:", assistantMessage.images);
      const imageData = assistantMessage.images[0];

      if (typeof imageData === 'string') {
        generatedImageUrl = imageData;
      } else if (imageData.image_url?.url) {
        generatedImageUrl = imageData.image_url.url;
      }
    }

    // Method 2: Check content array for image_url type
    if (!generatedImageUrl && assistantMessage?.content && Array.isArray(assistantMessage.content)) {
      console.log("Checking content array:", assistantMessage.content);
      for (const item of assistantMessage.content) {
        if (item.type === 'image_url' && item.image_url?.url) {
          generatedImageUrl = item.image_url.url;
          break;
        }
      }
    }

    // Method 3: Check for URL in text content
    if (!generatedImageUrl) {
      const content = assistantMessage?.content;
      if (content && typeof content === 'string') {
        console.log("Checking string content for URLs");
        const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|webp|gif)/i);
        if (urlMatch) {
          generatedImageUrl = urlMatch[0];
        }
      }
    }

    // Method 4: Check top-level data field
    if (!generatedImageUrl && imageGenData.data) {
      console.log("Checking top-level data field:", imageGenData.data);
      if (Array.isArray(imageGenData.data) && imageGenData.data[0]?.url) {
        generatedImageUrl = imageGenData.data[0].url;
      } else if (typeof imageGenData.data === 'string') {
        generatedImageUrl = imageGenData.data;
      }
    }

    if (!generatedImageUrl) {
      console.error("Failed to extract image URL. Response structure:", {
        hasChoices: !!imageGenData.choices,
        choicesLength: imageGenData.choices?.length,
        hasMessage: !!assistantMessage,
        messageKeys: assistantMessage ? Object.keys(assistantMessage) : [],
        messageContentType: typeof assistantMessage?.content,
        isContentArray: Array.isArray(assistantMessage?.content),
        topLevelKeys: Object.keys(imageGenData),
        fullResponse: JSON.stringify(imageGenData).substring(0, 500)
      });
      throw new Error("未能生成图片 - API返回格式异常。请查看浏览器控制台了解详情");
    }

    console.log("Successfully generated image");

    const results: ModifiedImage[] = [];

    for (let i = 0; i < numImages; i++) {
      const similarity = generateRandomSimilarity(modificationLevel);
      const difference = 100 - similarity;

      results.push({
        url: generatedImageUrl,
        originalUrl: imageUrl,
        similarity: similarity,
        difference: difference,
      });
    }

    return results;
  } catch (error) {
    console.error("AI processing failed:", error);
    throw error;
  }
}

async function modifySingleImageFromBase64(
  base64Image: string,
  modificationLevel: number,
  logoText: string = "",
  fileName: string = "image"
): Promise<ModifiedImage[]> {
  try {
    console.log(`Step 1: Analyzing ${fileName} with GPT-4o...`);

    const descriptionResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Product Image Modifier",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this product image in extreme detail. This image may contain text in ANY language (Chinese, Russian, English, etc.) and may have complex layouts with information panels.\n\n1. IMAGE LAYOUT:\n   - Describe the overall layout (product photo only, or product + information panel)\n   - If there's an information panel (left/right/top/bottom), note its position and color\n   - Note exact image dimensions\n\n2. PRODUCT PHYSICAL DETAILS (most important):\n   - Exact product type (vacuum cleaner, bottle, box, appliance, etc.)\n   - Precise shape and form\n   - Material appearance (plastic, metal, glass, stainless steel, etc.)\n   - Colors and design elements\n   - Size and proportions\n\n3. ALL TEXT IN IMAGE (CRITICAL - in ANY language):\n   ⚠️ IMPORTANT: Identify and list ALL text, regardless of language (Chinese, Russian, English, etc.)\n   \n   Categorize each text element as:\n   A) BRAND NAME/LOGO: Company names, brand logos, trademark symbols\n      Examples: \"Nike\", \"Adidas\", \"Янцзы\" (brand name)\n   \n   B) PRODUCT FEATURES/SELLING POINTS: All descriptive text about the product\n      Examples: \"防水\" (waterproof), \"1500W большая мощность\" (1500W high power)\n      \"18L емкость\" (18L capacity), \"Нержавеющая сталь\" (stainless steel)\n   \n   C) SPECIFICATIONS/INFO: Technical details, measurements, instructions\n   \n   For EACH text element, note:\n   - The exact text (in original language)\n   - Its category (A/B/C)\n   - Its location on the image\n   - Font size and style\n\n4. BACKGROUND:\n   - Background type and colors\n   - Lighting direction\n\nIMPORTANT: List ALL text visible in the image, preserving the original language. We need to distinguish brand names from product features.",
              },
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ],
          },
        ],
        max_tokens: 1200,
      }),
    });

    if (!descriptionResponse.ok) {
      const errorData = await descriptionResponse.json();
      throw new Error(`图片分析失败: ${errorData.error?.message || '未知错误'}`);
    }

    const descriptionData = await descriptionResponse.json();
    const description = descriptionData.choices?.[0]?.message?.content;

    if (!description) {
      throw new Error("未能获取图片描述");
    }

    console.log(`Step 2: Generating modified image for ${fileName}...`);

    const modifiedPrompt = generateModificationPrompt(description, modificationLevel, logoText);
    const numImages = 1;

    const imageGenResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Product Image Modifier",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: modifiedPrompt,
              },
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
        max_tokens: 2048,
      }),
    });

    if (!imageGenResponse.ok) {
      const errorText = await imageGenResponse.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`图片生成失败 (${imageGenResponse.status}): ${errorData.error?.message || errorText.substring(0, 200)}`);
      } catch (e) {
        throw new Error(`图片生成失败 (${imageGenResponse.status}): ${errorText.substring(0, 200)}`);
      }
    }

    const imageGenData = await imageGenResponse.json();
    const assistantMessage = imageGenData.choices?.[0]?.message;

    let generatedImageUrl: string | null = null;

    if (assistantMessage?.images && Array.isArray(assistantMessage.images) && assistantMessage.images.length > 0) {
      const imageData = assistantMessage.images[0];
      if (typeof imageData === 'string') {
        generatedImageUrl = imageData;
      } else if (imageData.image_url?.url) {
        generatedImageUrl = imageData.image_url.url;
      }
    }

    if (!generatedImageUrl && assistantMessage?.content && Array.isArray(assistantMessage.content)) {
      for (const item of assistantMessage.content) {
        if (item.type === 'image_url' && item.image_url?.url) {
          generatedImageUrl = item.image_url.url;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      const content = assistantMessage?.content;
      if (content && typeof content === 'string') {
        const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|webp|gif)/i);
        if (urlMatch) {
          generatedImageUrl = urlMatch[0];
        }
      }
    }

    if (!generatedImageUrl && imageGenData.data) {
      if (Array.isArray(imageGenData.data) && imageGenData.data[0]?.url) {
        generatedImageUrl = imageGenData.data[0].url;
      } else if (typeof imageGenData.data === 'string') {
        generatedImageUrl = imageGenData.data;
      }
    }

    if (!generatedImageUrl) {
      throw new Error("未能生成图片 - API返回格式异常");
    }

    const results: ModifiedImage[] = [];
    const similarity = generateRandomSimilarity(modificationLevel);
    const difference = 100 - similarity;

    results.push({
      url: generatedImageUrl,
      originalUrl: base64Image,
      similarity: similarity,
      difference: difference,
    });

    return results;
  } catch (error) {
    console.error("AI processing failed:", error);
    throw error;
  }
}

function generateModificationPrompt(description: string, modificationLevel: number, logoText: string): string {
  let modifications = '';

  if (modificationLevel <= 25) {
    modifications = 'Subtle adjustments: slightly different lighting angle (keep shadows), minor color temperature shift in background only, subtle background blur or texture variation. Product appearance must be 95%+ identical.';
  } else if (modificationLevel <= 50) {
    modifications = 'Moderate changes: different background color or pattern, adjusted lighting direction and intensity (affecting shadows only), different background style. Product packaging design, colors, and shape must remain 90%+ identical.';
  } else if (modificationLevel <= 75) {
    modifications = 'Significant changes: completely new background setting or environment, dramatic lighting changes (affecting shadows and ambient light), new background theme, slightly adjusted camera angle (max 15 degrees). Product itself must remain 85%+ recognizable.';
  } else {
    modifications = 'Major transformation: entirely different background scene, creative lighting setup, new artistic style for environment, varied composition perspective. Product physical appearance must remain 80%+ identical - same container, same design elements, same proportions.';
  }

  const logoInstructions = logoText
    ? `\n\n5. TEXT HANDLING - MULTILINGUAL SUPPORT (CRITICAL):
   ⚠️ WORKS WITH ALL LANGUAGES: Chinese, Russian, English, etc.
   ⚠️ ONLY REMOVE BRAND IDENTITY - KEEP ALL SELLING POINTS!

   STEP 1 - IDENTIFY TEXT TYPES (in ANY language):
   - Brand Identity: Company names, brand logos, trademark symbols
     * Chinese: "Nike", "耐克", "Adidas", "阿迪达斯"
     * Russian: "Янцзы" (brand name), company logos
     * English: "Nike", "Apple", brand emblems

   - Selling Points: ALL product feature descriptions, specifications, benefits
     * Chinese: "防水", "透气", "轻便", "5小时续航"
     * Russian: "Нержавеющая сталь" (stainless steel), "1500W большая мощность" (1500W high power),
       "18L емкость обновления" (18L capacity), "Многофункциональная модель" (multifunctional model)
     * English: "Waterproof", "Lightweight", "Fast Charging", specifications

   STEP 2 - SELECTIVE REMOVAL (ONLY brand identity):
   ✅ KEEP 100% of ALL selling point text in original language
   ✅ KEEP ALL product specifications and technical details
   ✅ KEEP ALL feature descriptions and benefits
   ✅ KEEP information panels (red/colored sidebars with product info)
   ❌ REMOVE ONLY brand names, company logos, trademark symbols

   STEP 3 - ADD NEW LOGO:
   - ADD the text "${logoText}" as NEW professional brand logo
   - Place where old brand logo was, or in prominent clean location
   - Logo styling:
     * Clean, professional font (sans-serif)
     * HIGH CONTRAST with background:
       - Light bg (>70%): DARK text (#000000, #333333)
       - Dark bg (<30%): WHITE text (#FFFFFF)
       - Medium bg: maximum contrast
     * Add subtle shadow/outline for visibility

   EXAMPLES:
   Chinese: "耐克 防水透气 轻便" → "${logoText} 防水透气 轻便"
   Russian: "Янцзы Нержавеющая сталь" → "${logoText} Нержавеющая сталь"

   ⚠️ CRITICAL: ALL selling points in ALL languages MUST remain 100% visible and readable!`
    : `\n\n5. TEXT HANDLING - MULTILINGUAL SUPPORT (CRITICAL):
   ⚠️ WORKS WITH ALL LANGUAGES: Chinese, Russian, English, etc.
   ⚠️ ONLY REMOVE BRAND IDENTITY - KEEP ALL SELLING POINTS!

   STEP 1 - IDENTIFY TEXT TYPES (in ANY language):
   - Brand Identity: Company names, brand logos, trademark symbols
     * Chinese: "Nike", "耐克", "Adidas"
     * Russian: "Янцзы" (brand name)
     * English: "Nike", "Apple"

   - Selling Points: ALL product feature descriptions
     * Chinese: "防水", "透气", "轻便"
     * Russian: "Нержавеющая сталь" (stainless steel), "1500W большая мощность" (1500W),
       "18L емкость" (18L capacity)
     * English: "Waterproof", "Lightweight"

   STEP 2 - SELECTIVE REMOVAL (ONLY brand identity):
   ✅ KEEP 100% of ALL selling point text in original language
   ✅ KEEP ALL specifications and features
   ✅ KEEP information panels (colored sidebars)
   ❌ REMOVE ONLY brand names/logos

   STEP 3 - RESULT:
   - Product looks unbranded (no company logos)
   - ALL selling points remain visible in original language
   - Information panels fully preserved

   EXAMPLES:
   Chinese: "耐克 防水透气" → "防水透气"
   Russian: "Янцзы Нержавеющая сталь" → "Нержавеющая сталь"

   ⚠️ CRITICAL: ALL selling points in ALL languages MUST remain 100% visible!`;

  const dimensionInstructions = `\n\n6. IMAGE DIMENSIONS (CRITICAL):
   - Output image MUST maintain EXACTLY the same dimensions as input
   - Width and height must match the input image precisely
   - Do NOT crop, resize, or change aspect ratio
   - Preserve all edges and corners of the original image`;

  const textColorInstructions = `\n\n7. TEXT VISIBILITY - MULTILINGUAL (CRITICAL):
   - ALL text in ALL languages (Chinese/Russian/English/etc.) MUST be readable
   - Information panels (red/colored sidebars) MUST be preserved with all text
   - Text contrast rules:
     * White text + light background → change to dark OR add strong shadow/outline
     * Dark text + dark background → change to light OR add glow
     * Red/colored panels: preserve panel color, ensure text is readable
   - Text readability is MANDATORY for:
     * All selling points (any language)
     * All specifications and features
     * All information panel text
   - Adjust text colors intelligently based on new background
   - For complex layouts with panels: keep panel structure, adjust only background outside panels`;

  return `CRITICAL TASK: MINIMAL IMAGE EDITING - PRESERVE PRODUCT APPEARANCE

⚠️ ABSOLUTE RULE: The product container/packaging/design MUST remain virtually IDENTICAL to the input image.

Apply ONLY these modifications: ${modifications}

=== CRITICAL REQUIREMENTS (FAILURE = REJECTED OUTPUT) ===

1. PRODUCT PRESERVATION (HIGHEST PRIORITY):
   ❌ DO NOT redesign the product
   ❌ DO NOT change product colors significantly
   ❌ DO NOT alter product shape or proportions
   ❌ DO NOT modify packaging design elements (except logos/text removal)
   ❌ DO NOT change container type or material appearance

   ✅ KEEP the exact same product container/bottle/box/package
   ✅ KEEP all design elements (patterns, graphics, color schemes)
   ✅ KEEP product dimensions and proportions
   ✅ KEEP material appearance (plastic, metal, glass, cardboard, etc.)
   ✅ KEEP ALL selling point text in ALL languages (Chinese, Russian, English, etc.)
   ✅ KEEP information panels (red/colored sidebars with product specifications)
   ✅ KEEP ALL product features, specifications, and technical details
   ✅ KEEP the exact same image dimensions (width x height)
   ✅ KEEP the overall layout structure (product photo + info panel if present)
   ✅ ONLY modify: background environment behind product, lighting/shadows, and remove ONLY brand logos/names

2. WHAT YOU MAY CHANGE:
   - Background ONLY (color, pattern, environment, setting)
   - Lighting direction and intensity (affecting shadows/reflections ONLY)
   - Remove ONLY brand logos/company names (NOT selling points)
   - Add new brand logo if specified (cleanly, professionally placed)
   - Text colors for better visibility against new background
   - Camera angle slightly (max 15° if modification level is high)

3. WHAT YOU MUST NOT CHANGE:
   - Product's physical appearance (container shape, material, texture)
   - Product's color scheme and design graphics (except removing brand logos)
   - Product's size and proportions
   - Product's packaging style and design elements
   - Image dimensions (width x height)
   - Selling point text content in ANY language (features, benefits, specifications)
   - Product information text (ingredients, certifications, instructions)
   - Information panels structure and color (red/colored sidebars)
   - Panel text in original language (Russian, Chinese, English, etc.)
   - Overall product recognizability
   - Layout structure (don't merge panels into background or remove them)

4. EDITING APPROACH:
   - Think: "I'm using Photoshop to change the background behind this product"
   - Think: "The product is a physical object I cannot alter - I can only change its environment"
   - For images with information panels: Keep the panel structure intact, only modify background behind/around the product
   - The output product should look like it's the SAME physical item photographed in a different setting

5. SPECIAL HANDLING FOR COMPLEX LAYOUTS:
   - If image has information panel (red/colored sidebar with specs):
     * KEEP the panel with ALL its text in original language
     * KEEP panel colors and structure
     * Only modify the background behind the product photo area
     * Don't blend panel into background
   - Multi-language support:
     * Preserve ALL text in Russian (Нержавеющая сталь, емкость, etc.)
     * Preserve ALL text in Chinese (防水, 透气, etc.)
     * Preserve ALL text in English or any other language
     * Only remove brand names, keep all feature descriptions

6. VERIFICATION CHECK (before output):
   ✓ Can I recognize this as the SAME product from the input?
   ✓ Did I only change the background/environment/lighting?
   ✓ Does the product container/packaging look virtually identical?
   ✓ Are ALL selling points in ALL languages still visible and readable?
   ✓ If there was an information panel, is it still there with all text?
   ✓ Would someone say "same product, same layout, different background"?

${logoInstructions}
${dimensionInstructions}
${textColorInstructions}

Reference description: "${description}"

=== FINAL REMINDER ===
OUTPUT = Same product + Different background/lighting
NOT = New product inspired by the input

The person viewing the output should immediately recognize it as THE SAME PHYSICAL PRODUCT from the input image, just photographed in a different setting or lighting condition.`;
}

function generateRandomSimilarity(modificationLevel: number): number {
  const baseSimilarity = 100 - modificationLevel;
  const variance = 15;
  const random = (Math.random() - 0.5) * variance;
  return Math.max(30, Math.min(90, baseSimilarity + random));
}
