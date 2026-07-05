// Tool: スライスドロップ
import { createToolStorage, copyToClipboard } from '../../js/lib/storage.js';

export function sliceText(text, limit, addPrefix) {
    const chars = Array.from(text);
    let results = [];
    if (chars.length === 0) return results;

    if (addPrefix) {
        let assumedTotalPages = 1;
        let lastTotalPages = 0;

        // ページ数の桁数変化によるズレを収束させるためのループ（最大10回）
        for (let iter = 0; iter < 10; iter++) {
            results = [];
            let currentChunk = [];
            let currentLength = 0;
            let pageIndex = 1;

            // 各ページごとの有効な上限（プレフィックス長を引いたもの）を計算しながら分割
            let prefixStr = `${pageIndex}/${assumedTotalPages}\n\n`;
            let effectiveLimit = limit - prefixStr.length;
            if (effectiveLimit < 1) effectiveLimit = 1;

            for (const char of chars) {
                const charWeight = char.length;
                if (currentLength + charWeight > effectiveLimit) {
                    results.push(currentChunk.join(''));
                    
                    pageIndex++;
                    prefixStr = `${pageIndex}/${assumedTotalPages}\n\n`;
                    effectiveLimit = limit - prefixStr.length;
                    if (effectiveLimit < 1) effectiveLimit = 1;

                    currentChunk = [char];
                    currentLength = charWeight;
                } else {
                    currentChunk.push(char);
                    currentLength += charWeight;
                }
            }
            if (currentChunk.length > 0) {
                results.push(currentChunk.join(''));
            }

            const actualTotalPages = results.length;
            // 算出された総ページ数が、想定あるいは前回の結果と一致すれば確定
            if (actualTotalPages === assumedTotalPages || actualTotalPages === lastTotalPages) {
                break;
            }
            lastTotalPages = assumedTotalPages;
            assumedTotalPages = actualTotalPages;
        }

        const totalPages = results.length;
        results = results.map((chunk, index) => {
            return `${index + 1}/${totalPages}\n\n${chunk}`;
        });
    } else {
        let currentChunk = [];
        let currentLength = 0;
        for (const char of chars) {
            const charWeight = char.length;
            if (currentLength + charWeight > limit) {
                results.push(currentChunk.join(''));
                currentChunk = [char];
                currentLength = charWeight;
            } else {
                currentChunk.push(char);
                currentLength += charWeight;
            }
        }
        if (currentChunk.length > 0) {
            results.push(currentChunk.join(''));
        }
    }
    return results;
}

export default function init() {
    const sdInput = document.getElementById('sd-input');
    const sdLimitInput = document.getElementById('sd-limit');
    const sdOutputText = document.getElementById('sd-output-text');
    const sdBtnPrev = document.getElementById('sd-btn-prev');
    const sdBtnNext = document.getElementById('sd-btn-next');
    const sdPaginationInfo = document.getElementById('sd-pagination-info');
    const sdCurrentPageLabel = document.getElementById('sd-current-page-label');
    const sdTotalCharsElements = document.querySelectorAll('.sd-total-chars');
    const sdTotalPagesElements = document.querySelectorAll('.sd-total-pages');
    const sdBtnCopy = document.getElementById('sd-btn-copy');
    const sdBtnClear = document.getElementById('sd-btn-clear');
    const quickButtons = document.querySelectorAll('#tool-slice-drop .quick-limit-btn');
    const sdAddPrefix = document.getElementById('sd-add-prefix');

    if (!sdInput || !sdLimitInput || !sdAddPrefix) return;

    const storage = createToolStorage('sd');

    let chunks = [];
    let currentPageIndex = 0; // 0-based

    // LocalStorageから状態を復元
    const savedLimit = storage.get('limit');
    if (savedLimit) {
        sdLimitInput.value = savedLimit;
    }
    const savedText = storage.get('text');
    if (savedText) {
        sdInput.value = savedText;
    }
    const savedAddPrefix = storage.get('add-prefix');
    if (savedAddPrefix !== null) {
        sdAddPrefix.checked = savedAddPrefix === 'true';
    }

    const updateSlices = (shouldSave = true) => {
        let limit = parseInt(sdLimitInput.value, 10) || 140;
        limit = Math.min(50000, Math.max(10, limit)); // 最小10文字に制限
        sdLimitInput.value = limit;

        const text = sdInput.value;
        const chars = Array.from(text);

        // 外部の文字数カウント（サロゲートペアを2文字とカウントする仕様）に合わせた文字数計算
        let totalCharsCount = 0;
        for (const char of chars) {
            totalCharsCount += char.length;
        }

        sdTotalCharsElements.forEach(el => {
            el.textContent = totalCharsCount.toLocaleString();
        });

        // 分割処理
        chunks = sliceText(text, limit, sdAddPrefix.checked);

        const totalPages = chunks.length;
        sdTotalPagesElements.forEach(el => {
            el.textContent = totalPages.toLocaleString();
        });

        // ページインデックスの調整
        if (currentPageIndex >= totalPages) {
            currentPageIndex = Math.max(0, totalPages - 1);
        }

        updatePageDisplay();

        if (shouldSave) {
            storage.set('limit', limit);
            storage.set('text', text);
            storage.set('add-prefix', sdAddPrefix.checked);
        }
    };

    const updatePageDisplay = () => {
        const totalPages = chunks.length;

        if (totalPages === 0) {
            sdOutputText.value = '';
            sdPaginationInfo.textContent = 'ページ 0 / 0';
            sdCurrentPageLabel.textContent = '0/0';
            sdBtnPrev.disabled = true;
            sdBtnNext.disabled = true;
            return;
        }

        sdOutputText.value = chunks[currentPageIndex] || '';
        sdPaginationInfo.textContent = `ページ ${currentPageIndex + 1} / ${totalPages}`;
        sdCurrentPageLabel.textContent = `${currentPageIndex + 1}/${totalPages}`;

        sdBtnPrev.disabled = currentPageIndex === 0;
        sdBtnNext.disabled = currentPageIndex === totalPages - 1;
    };

    // 前のページ
    sdBtnPrev.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            updatePageDisplay();
        }
    });

    // 次のページ
    sdBtnNext.addEventListener('click', () => {
        if (currentPageIndex < chunks.length - 1) {
            currentPageIndex++;
            updatePageDisplay();
        }
    });

    // コピー
    sdBtnCopy.addEventListener('click', () => {
        copyToClipboard(sdOutputText.value, sdBtnCopy);
    });

    // クリア
    sdBtnClear.addEventListener('click', () => {
        sdInput.value = '';
        currentPageIndex = 0;
        updateSlices(true);
    });

    // イベントリスナー
    sdInput.addEventListener('input', () => {
        updateSlices(true);
    });

    sdLimitInput.addEventListener('input', () => {
        updateSlices(true);
    });

    sdAddPrefix.addEventListener('change', () => {
        updateSlices(true);
    });

    // クイックボタン
    quickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const limit = btn.getAttribute('data-limit');
            if (limit) {
                sdLimitInput.value = limit;
                updateSlices(true);
            }
        });
    });

    // 初期処理
    updateSlices(false);
}