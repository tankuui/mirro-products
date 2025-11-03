function extractOzonProductData() {
  const data = {
    productUrl: window.location.href,
    productTitle: '',
    images: [],
    description: ''
  };

  try {
    const titleElement = document.querySelector('h1[data-widget="webProductHeading"]');
    if (titleElement) {
      data.productTitle = titleElement.textContent.trim();
    }

    const imageElements = document.querySelectorAll('img[src*="multimedia"], img[src*="cdn"], img[alt*="фото"]');
    const imageUrls = new Set();

    imageElements.forEach(img => {
      let src = img.src || img.getAttribute('data-src');

      if (src && src.includes('wc') && !src.includes('avatar') && !src.includes('logo')) {
        src = src.replace(/wc\d+/, 'wc1200');

        if (src.match(/\.(jpg|jpeg|png|webp)/i)) {
          imageUrls.add(src);
        }
      }
    });

    data.images = Array.from(imageUrls);

    const descriptionSelectors = [
      '[data-widget="webDescription"]',
      '[data-widget="webCharacteristics"]',
      '.product-description',
      '.characteristics'
    ];

    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        data.description += element.textContent.trim() + '\n\n';
      }
    }

    data.description = data.description.trim();

    console.log('提取的数据:', {
      标题: data.productTitle,
      图片数量: data.images.length,
      描述长度: data.description.length
    });

    return data;
  } catch (error) {
    console.error('提取数据失败:', error);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const data = extractOzonProductData();
    sendResponse(data);
  }
  return true;
});

console.log('Ozon商品处理插件已加载');
