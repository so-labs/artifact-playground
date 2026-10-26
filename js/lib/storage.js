import { t } from './i18n.js';

let tempMode = localStorage.getItem('app-temp-mode') === 'true';
const tempMemoryStorage = new Map();
const copyTimers = new Map();
const pasteTimers = new Map();
const downloadTimers = new Map();

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

    btn.textContent = t('common.copied');

    copyTimers.set(btn, setTimeout(() => {
      btn.textContent = t('common.copy');
      copyTimers.delete(btn);
    }, 1000));
  } else {
    alert(t('common.copyFailed'));
  }
}

export async function pasteFromClipboard(btn, onPaste) {
  let text = null;

  // 1. モダンな API (navigator.clipboard) を試行
  if (navigator.clipboard && window.isSecureContext && navigator.clipboard.readText) {
    try {
      text = await navigator.clipboard.readText();
    } catch (err) {
      console.warn('navigator.clipboard.readText failed, falling back to execCommand:', err);
    }
  }

  // 2. 非対応環境向けのフォールバック (execCommand)
  if (text === null) {
    try {
      const textarea = document.createElement('textarea');
      // 画面のチラつきやスクロールを防ぐスタイル設定
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);

      textarea.focus();

      const ok = document.execCommand('paste');
      if (ok) {
        text = textarea.value;
      }
      document.body.removeChild(textarea);
    } catch (err) {
      console.error('execCommand paste failed:', err);
    }
  }

  // 結果の判定とフィードバックUI表示
  if (text !== null) {
    if (typeof onPaste === 'function') {
      onPaste(text);
    }

    if (btn) {
      if (pasteTimers.has(btn)) {
        clearTimeout(pasteTimers.get(btn));
      }

      btn.textContent = t('common.pasted');

      pasteTimers.set(btn, setTimeout(() => {
        btn.textContent = t('common.paste');
        pasteTimers.delete(btn);
      }, 1000));
    }
  } else {
    alert(t('common.pasteFailed'));
  }
}

/**
 * Blobまたはテキストデータをファイルとしてダウンロード保存する
 * @param {Blob|string} content 保存するデータ
 * @param {string} filename ファイル名（例: 'clipboard.html', 'note.md'）
 * @param {HTMLElement} [btn] クリックされたボタン要素（フィードバック表示用、省略可能）
 * @param {Object} [options]
 * @param {string} [options.mimeType='text/plain'] contentが文字列の場合のMIMEタイプ
 * @param {string} [options.successText] 成功時にボタンに表示するテキスト
 * @param {string} [options.resetText] 復帰時にボタンに表示するテキスト
 * @param {number} [options.resetDelay=1200] ボタン表示を戻すまでの遅延ミリ秒
 * @param {Function} [options.onReset] 復帰時に実行するコールバック
 * @returns {Promise<boolean>} 保存処理の成否
 */
export async function downloadFile(content, filename, btn = null, options = {}) {
  try {
    let blob;
    if (content instanceof Blob) {
      blob = content;
    } else {
      const mime = options.mimeType || 'text/plain';
      blob = new Blob([String(content ?? '')], { type: mime });
    }

    const safeFilename = filename && String(filename).trim() !== '' ? filename : 'download';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (btn) {
      if (downloadTimers.has(btn)) {
        clearTimeout(downloadTimers.get(btn));
      }
      const successText = options.successText || t('common.downloaded');
      const resetText = options.resetText || btn.textContent;
      btn.textContent = successText;

      downloadTimers.set(btn, setTimeout(() => {
        if (typeof options.onReset === 'function') {
          options.onReset();
        } else {
          btn.textContent = resetText;
        }
        downloadTimers.delete(btn);
      }, options.resetDelay ?? 1200));
    }

    return true;
  } catch (err) {
    console.error('downloadFile failed:', err);
    alert(t('common.downloadFailed'));
    return false;
  }
}

