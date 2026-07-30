let tempMode = localStorage.getItem('app-temp-mode') === 'true';
const tempMemoryStorage = new Map();
const copyTimers = new Map();

export function isTempMode() {
  return tempMode;
}

export function setTempMode(enabled) {
  tempMode = !!enabled;
  localStorage.setItem('app-temp-mode', String(tempMode));
  if (!tempMode) {
    tempMemoryStorage.clear();
  }
}

export function createToolStorage(toolId) {
  const prefix = `${toolId}-`;

  return { get, set, remove, getNumber };

  function get(key, defaultValue = null) {
    if (tempMode) {
      const val = tempMemoryStorage.get(prefix + key);
      return val !== undefined ? val : defaultValue;
    }
    const val = localStorage.getItem(prefix + key);
    return val !== null ? val : defaultValue;
  }

  function getNumber(key, defaultValue = null) {
    const val = get(key);
    return val !== null ? Number(val) : defaultValue;
  }

  function set(key, value) {
    const strVal = String(value);
    if (tempMode) {
      tempMemoryStorage.set(prefix + key, strVal);
    } else {
      localStorage.setItem(prefix + key, strVal);
    }
  }

  function remove(key) {
    if (tempMode) {
      tempMemoryStorage.delete(prefix + key);
    } else {
      localStorage.removeItem(prefix + key);
    }
  }
}

export async function copyToClipboard(text, btn) {
  if (!text) return;

  let success = false;

  // 1. モダンな API (navigator.clipboard) を試行
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back to execCommand:', err);
    }
  }

  // 2. iOS Safari / モバイルブラウザ / 非対応環境向けのフォールバック (execCommand)
  if (!success) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      // 画面のチラつきやスクロールを防ぐスタイル設定
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();
      // iOS Safari 用に選択範囲を明示指定
      textarea.setSelectionRange(0, textarea.value.length);

      success = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (err) {
      console.error('execCommand copy failed:', err);
    }
  }

  // 結果の判定とフィードバックUI表示
  if (success) {
    if (copyTimers.has(btn)) {
      clearTimeout(copyTimers.get(btn));
    }

    btn.textContent = 'コピー完了！';

    copyTimers.set(btn, setTimeout(() => {
      btn.textContent = 'コピー';
      copyTimers.delete(btn);
    }, 1000));
  } else {
    alert('クリップボードへのコピーに失敗しました。');
  }
}
