let lines = [];
let currentIndex = 0;
let panel = null;


function createPanel() {
  const div = document.createElement('div');
  div.id = 'txt-reader-panel';
  div.textContent = ' ';
  document.body.prepend(div);
  return div;
}

panel = createPanel();

// 点击面板跳转下一行
panel.addEventListener('click', () => {
  if (lines.length === 0) return;
  currentIndex = (currentIndex + 1) % lines.length;
  panel.textContent = lines[currentIndex];
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'OPEN_FILE') {
    openAndReadTxt();
  }
});

function openAndReadTxt() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 自动识别编码读取
      const text = await readTextFileAutoEncoding(file);

      // 过滤空行
      lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      currentIndex = 0;

      if (lines.length > 0) {
        panel.textContent = lines[0];
      } else {
        panel.textContent = '文件为空';
      }
    } catch (err) {
      panel.textContent = '读取失败：' + err.message;
    }
  };

  input.click();
}

async function readTextFileAutoEncoding(file) {
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder('utf-8');
  try {
    const text = decoder.decode(buffer);
    if (isValidUtf8(text)) {
      return text;
    }
  } catch {}

  const gbkDecoder = new TextDecoder('gbk');
  return gbkDecoder.decode(buffer);
}

function isValidUtf8(str) {
  try {
    new TextEncoder().encode(str);
    return !/[\uFFFD]/.test(str);
  } catch {
    return false;
  }
}