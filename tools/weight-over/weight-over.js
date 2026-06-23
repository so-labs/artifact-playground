// Tool: ウエイトオーバー
export default function init() {
    const woInput = document.getElementById('wo-input');
    const woLimitInput = document.getElementById('wo-limit');
    const woCountEl = document.getElementById('wo-count');
    const woLimitDisplay = document.getElementById('wo-limit-display');
    const woCounter = document.getElementById('wo-counter');
    const woSection = document.getElementById('tool-weight-over');
    const quickButtons = document.querySelectorAll('.quick-limit-btn');
    const woBtnClear = document.getElementById('wo-btn-clear');

    if (!woInput || !woLimitInput) return;

    // LocalStorageから状態を復元
    const savedLimit = localStorage.getItem('wo-limit');
    if (savedLimit) {
        woLimitInput.value = savedLimit;
    }
    const savedText = localStorage.getItem('wo-text');
    if (savedText !== null && savedText !== '') {
        woInput.value = savedText;
    }

    const updateWoCount = (shouldSave = true) => {
        let limit = parseInt(woLimitInput.value, 10) || 1000;
        limit = Math.min(50000, Math.max(1, limit));
        woLimitInput.value = limit;
        woLimitDisplay.textContent = limit;

        const text = woInput.value;
        const count = Array.from(text).length;
        woCountEl.textContent = count.toLocaleString();

        woSection.classList.remove('wo-warning', 'wo-over');
        woCounter.classList.remove('warning', 'over');

        if (count > limit) {
            woSection.classList.add('wo-over');
            woCounter.classList.add('over');
        } else if (count > limit * 0.95) {
            woSection.classList.add('wo-warning');
            woCounter.classList.add('warning');
        }

        // 状態を保存
        if (shouldSave) {
            localStorage.setItem('wo-limit', limit);
            localStorage.setItem('wo-text', text);
        }
    };

    woInput.addEventListener('input', () => updateWoCount(true));
    woLimitInput.addEventListener('input', () => updateWoCount(true));

    // クイックボタンのイベント設定
    quickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const limit = btn.getAttribute('data-limit');
            if (limit) {
                woLimitInput.value = limit;
                updateWoCount(true);
            }
        });
    });

    if (woBtnClear) {
        woBtnClear.addEventListener('click', () => {
            woInput.value = '';
            updateWoCount(true);
        });
    }

    // 初期ロード時はLocalStorageへの自動保存を行わない
    updateWoCount(false);
}