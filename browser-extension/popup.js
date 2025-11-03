const API_BASE_URL = 'http://localhost:3000';

let extractedData = null;
let currentTaskId = null;

const elements = {
  extractBtn: document.getElementById('extractBtn'),
  processBtn: document.getElementById('processBtn'),
  viewTaskBtn: document.getElementById('viewTaskBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  status: document.getElementById('status'),
  infoBox: document.getElementById('infoBox'),
  productTitle: document.getElementById('productTitle'),
  imageCount: document.getElementById('imageCount'),
  descLength: document.getElementById('descLength')
};

function showStatus(message, type = 'info') {
  elements.status.textContent = message;
  elements.status.className = `status show status-${type}`;
  setTimeout(() => {
    elements.status.classList.remove('show');
  }, 3000);
}

function updateUI(data) {
  if (data) {
    const titleText = data.productTitle || '未获取';
    elements.productTitle.textContent = titleText.length > 20
      ? titleText.substring(0, 20) + '...'
      : titleText;
    elements.imageCount.textContent = data.images.length;
    elements.descLength.textContent = data.description.length + ' 字符';
    elements.infoBox.classList.add('show');
    elements.processBtn.style.display = 'block';
    elements.processBtn.disabled = false;
  }
}

function setLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    const text = btn.querySelector('span:last-child');
    const originalText = text.textContent;
    btn.dataset.originalText = originalText;
    text.textContent = '处理中...';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    btn.querySelector('span:first-child').replaceWith(spinner);
  } else {
    btn.disabled = false;
    const text = btn.querySelector('span:last-child');
    if (btn.dataset.originalText) {
      text.textContent = btn.dataset.originalText;
    }
    const spinner = btn.querySelector('.spinner');
    if (spinner) {
      const icon = document.createElement('span');
      icon.textContent = btn === elements.extractBtn ? '📸' : '🚀';
      spinner.replaceWith(icon);
    }
  }
}

elements.extractBtn.addEventListener('click', async () => {
  setLoading(elements.extractBtn, true);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('ozon.ru/product')) {
      showStatus('请在Ozon商品页面使用此功能', 'error');
      setLoading(elements.extractBtn, false);
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });

    if (!response) {
      showStatus('提取失败，请刷新页面重试', 'error');
      setLoading(elements.extractBtn, false);
      return;
    }

    if (response.images.length === 0) {
      showStatus('未找到商品图片', 'error');
      setLoading(elements.extractBtn, false);
      return;
    }

    extractedData = response;
    updateUI(extractedData);
    showStatus(`成功提取 ${extractedData.images.length} 张图片`, 'success');
  } catch (error) {
    console.error('提取失败:', error);
    showStatus('提取失败: ' + error.message, 'error');
  } finally {
    setLoading(elements.extractBtn, false);
  }
});

elements.processBtn.addEventListener('click', async () => {
  if (!extractedData) {
    showStatus('请先提取商品数据', 'error');
    return;
  }

  setLoading(elements.processBtn, true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productUrl: extractedData.productUrl,
        productTitle: extractedData.productTitle,
        images: extractedData.images,
        description: extractedData.description,
      }),
    });

    if (!response.ok) {
      throw new Error('提交任务失败');
    }

    const data = await response.json();
    currentTaskId = data.taskId;

    chrome.storage.local.set({ lastTaskId: currentTaskId });

    showStatus('任务已创建，正在处理中', 'success');
    elements.processBtn.style.display = 'none';
    elements.viewTaskBtn.style.display = 'block';

    chrome.tabs.create({
      url: `${API_BASE_URL}/tasks/${currentTaskId}`
    });
  } catch (error) {
    console.error('提交失败:', error);
    showStatus('提交失败: ' + error.message, 'error');
  } finally {
    setLoading(elements.processBtn, false);
  }
});

elements.viewTaskBtn.addEventListener('click', () => {
  if (currentTaskId) {
    chrome.tabs.create({
      url: `${API_BASE_URL}/tasks/${currentTaskId}`
    });
  } else {
    chrome.storage.local.get(['lastTaskId'], (result) => {
      if (result.lastTaskId) {
        chrome.tabs.create({
          url: `${API_BASE_URL}/tasks/${result.lastTaskId}`
        });
      } else {
        chrome.tabs.create({
          url: `${API_BASE_URL}/tasks`
        });
      }
    });
  }
});

elements.settingsBtn.addEventListener('click', () => {
  chrome.tabs.create({
    url: `${API_BASE_URL}/config`
  });
});

chrome.storage.local.get(['lastTaskId'], (result) => {
  if (result.lastTaskId) {
    currentTaskId = result.lastTaskId;
    elements.viewTaskBtn.style.display = 'block';
  }
});
