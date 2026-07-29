let tempMode = localStorage.getItem('app-temp-mode') === 'true';
const tempMemoryStorage = new Map();

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

  try {
    await navigator.clipboard.writeText(text);

    if (copyTimers.has(btn)) {
      clearTimeout(copyTimers.get(btn));
    }

    btn.textContent = 'コピー完了！';

    copyTimers.set(btn, setTimeout(() => {
      btn.textContent = 'コピー';
      copyTimers.delete(btn);
    }, 1000));
  } catch (err) {
    console.error('Failed to copy text: ', err);
    alert('クリップボードへのコピーに失敗しました。');
  }
}
