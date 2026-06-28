const copyTimers = new WeakMap();

export function createToolStorage(toolId) {
  const prefix = `${toolId}-`;

  return { get, set, remove, getNumber };

  function get(key, defaultValue = null) {
    const val = localStorage.getItem(prefix + key);
    return val !== null ? val : defaultValue;
  }

  function getNumber(key, defaultValue = null) {
    const val = get(key);
    return val !== null ? Number(val) : defaultValue;
  }

  function set(key, value) {
    localStorage.setItem(prefix + key, String(value));
  }

  function remove(key) {
    localStorage.removeItem(prefix + key);
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
