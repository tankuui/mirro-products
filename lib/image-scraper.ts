export async function scrapeProductImages(url: string): Promise<string[]> {
  try {
    if (!url || !url.startsWith('http')) {
      throw new Error('请提供有效的 HTTP/HTTPS 链接');
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`网页请求失败: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error('该链接返回的不是网页内容，请提供商品页面链接');
    }

    let html: string;
    try {
      html = await response.text();
    } catch (error) {
      console.error('读取网页内容失败:', error);
      throw new Error('无法读取网页内容');
    }

    if (!html || html.length < 100) {
      throw new Error('网页内容为空或过短');
    }
    const images: string[] = [];

    const imgPatterns = [
      /<img[^>]+src=["']([^"']+)["']/gi,
      /<img[^>]+data-src=["']([^"']+)["']/gi,
      /<img[^>]+data-original=["']([^"']+)["']/gi,
      /<img[^>]+data-lazy-img=["']([^"']+)["']/gi,
      /src:\s*["']([^"']+\.(?:jpg|jpeg|png|webp))["']/gi,
      /"(?:picUrl|imgUrl|imageUrl|image)":\s*"([^"]+)"/gi,
    ];

    for (const pattern of imgPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const src = match[1];
        if (src) {
          processImageUrl(src, url, images);
        }
      }
    }

    const uniqueImages = Array.from(new Set(images));

    const validImages = uniqueImages.filter(img => {
      try {
        new URL(img);
        return true;
      } catch {
        return false;
      }
    });

    return validImages.slice(0, 15);
  } catch (error) {
    console.error('抓取图片失败:', error);
    throw new Error('无法从该链接抓取图片，请检查链接是否正确');
  }
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
    imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) &&
    !imageUrl.includes('logo') &&
    !imageUrl.includes('icon') &&
    !imageUrl.includes('avatar') &&
    !imageUrl.includes('sprite') &&
    !imageUrl.includes('button') &&
    !imageUrl.includes('badge') &&
    imageUrl.length < 500
  ) {
    images.push(imageUrl);
  }
}
