// Tool: スライスドロップ
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

    if (!sdInput || !sdLimitInput) return;

    let chunks = [];
    let currentPageIndex = 0; // 0-based

    // LocalStorageから状態を復元
    const savedLimit = localStorage.getItem('sd-limit');
    if (savedLimit) {
        sdLimitInput.value = savedLimit;
    }
    const savedText = localStorage.getItem('sd-text');
    if (savedText !== null && savedText !== '') {
        sdInput.value = savedText;
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

        // 分割処理（絵文字が途中で切れないようにしつつ、外部仕様の文字数制限に合わせて分割）
        chunks = [];
        if (chars.length > 0) {
            let currentChunk = [];
            let currentLength = 0;
            for (const char of chars) {
                const charWeight = char.length;
                if (currentLength + charWeight > limit) {
                    chunks.push(currentChunk.join(''));
                    currentChunk = [char];
                    currentLength = charWeight;
                } else {
                    currentChunk.push(char);
                    currentLength += charWeight;
                }
            }
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join(''));
            }
        }

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
            localStorage.setItem('sd-limit', limit);
            localStorage.setItem('sd-text', text);
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
    let copyResetTimer = null;
    sdBtnCopy.addEventListener('click', async () => {
        const textToCopy = sdOutputText.value;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            if (copyResetTimer) clearTimeout(copyResetTimer);
            sdBtnCopy.textContent = 'コピー完了！';
            sdBtnCopy.classList.add('primary');
            copyResetTimer = setTimeout(() => {
                sdBtnCopy.textContent = 'コピー';
                sdBtnCopy.classList.remove('primary');
                copyResetTimer = null;
            }, 1000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('クリップボードへのコピーに失敗しました。');
        }
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