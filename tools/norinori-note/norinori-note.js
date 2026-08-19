// Tool: ノリノリ音符
import { createToolStorage, copyToClipboard } from '../../js/lib/storage.js';
import { t, onLanguageChange, applyTranslations } from '../../js/lib/i18n.js';

export function makeNorinori(text, notes = ['♪', '♫', '♬']) {
    if (!text) return '';

    // 1. 文頭と文末の余白や改行を削除
    let cleaned = text.trim();

    // 2. 改行コードの統一 (\r\n や \r を \n に)
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 3. 連続する改行コードを1つにまとめる
    cleaned = cleaned.replace(/\n+/g, '\n');

    if (!cleaned) {
        return '';
    }

    const getRandomNote = () => {
        return notes[Math.floor(Math.random() * notes.length)];
    };

    // 4. 行に分割して、それぞれの末尾にランダムな音符を追加して結合
    const lines = cleaned.split('\n');
    return lines.map(line => line + getRandomNote()).join('');
}

export default function init() {
    const section = document.getElementById('tool-norinori-note');
    const inputEl = document.getElementById('nn-input');
    const outputEl = document.getElementById('nn-output');
    const btnConvert = document.getElementById('nn-btn-convert');
    const btnClear = document.getElementById('nn-btn-clear');
    const btnCopy = document.getElementById('nn-btn-copy');

    if (!inputEl || !btnConvert) return;

    const storage = createToolStorage('nn');

    // LocalStorageから状態を復元
    const savedText = storage.get('text');
    if (savedText !== null) {
        inputEl.value = savedText;
    } else {
        inputEl.value = t('tool.norinori.sample');
    }

    // 入力テキストの変更を保存
    inputEl.addEventListener('input', () => {
        storage.set('text', inputEl.value);
    });

    // ノリノリにする処理
    btnConvert.addEventListener('click', () => {
        const text = inputEl.value;
        outputEl.value = makeNorinori(text);
    });

    // 入力・出力エリアのクリア
    btnClear.addEventListener('click', () => {
        inputEl.value = '';
        outputEl.value = '';
        storage.set('text', '');
    });

    // クリップボードへコピー
    btnCopy.addEventListener('click', () => {
        copyToClipboard(outputEl.value, btnCopy);
    });

    // 言語変更の検知
    onLanguageChange(() => {
        if (section) applyTranslations(section);
        if (storage.get('text') === null) {
            inputEl.value = t('tool.norinori.sample');
        }
    });
}