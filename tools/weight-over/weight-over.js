// Tool: ウエイトオーバー
import { createToolStorage } from '../../js/lib/storage.js';
import { t, onLanguageChange, applyTranslations } from '../../js/lib/i18n.js';

export function checkWeight(text, limit) {
    const count = text.length;
    let status = 'normal'; // 'normal', 'warning', 'over'
    if (count > limit) {
        status = 'over';
    } else if (count > limit * 0.95) {
        status = 'warning';
    }
    return { count, status };
}

export default function init() {
    const woInput = document.getElementById('wo-input');
    const woLimitInput = document.getElementById('wo-limit');
    const woCountEl = document.getElementById('wo-count');
    const woLimitDisplay = document.getElementById('wo-limit-display');
    const woCounter = document.getElementById('wo-counter');
    const woSection = document.getElementById('tool-weight-over');
    const quickButtons = document.querySelectorAll('.quick-limit-btn');
    const woBtnClear = document.getElementById('wo-btn-clear');
    const woMildToggle = document.getElementById('wo-mild-toggle');

    if (!woInput || !woLimitInput) return;

    const storage = createToolStorage('wo');

    // LocalStorageから状態を復元
    const savedLimit = storage.get('limit');
    if (savedLimit) {
        woLimitInput.value = savedLimit;
    }
    const savedText = storage.get('text');
    if (savedText !== null) {
        woInput.value = savedText;
    } else {
        woInput.value = t('tool.weightOver.sample');
    }

    const isMild = storage.get('mild-mode') === 'true';
    if (isMild) {
        woSection.classList.add('wo-mild');
        if (woMildToggle) {
            woMildToggle.setAttribute('aria-checked', 'true');
        }
    }

    const updateWoCount = (shouldSave = true) => {
        let limit = parseInt(woLimitInput.value, 10) || 1000;
        limit = Math.min(50000, Math.max(1, limit));
        woLimitInput.value = limit;
        woLimitDisplay.textContent = limit;

        const text = woInput.value;
        const { count, status } = checkWeight(text, limit);
        woCountEl.textContent = count.toLocaleString();

        woSection.classList.remove('wo-warning', 'wo-over');
        woCounter.classList.remove('warning', 'over');

        if (status === 'over') {
            woSection.classList.add('wo-over');
            woCounter.classList.add('over');
        } else if (status === 'warning') {
            woSection.classList.add('wo-warning');
            woCounter.classList.add('warning');
        }

        // 状態を保存
        if (shouldSave) {
            storage.set('limit', limit);
            storage.set('text', text);
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
            storage.set('text', '');
            updateWoCount(true);
        });
    }

    if (woMildToggle) {
        woMildToggle.addEventListener('click', () => {
            const current = woMildToggle.getAttribute('aria-checked') === 'true';
            const next = !current;
            woMildToggle.setAttribute('aria-checked', String(next));
            
            if (next) {
                woSection.classList.add('wo-mild');
            } else {
                woSection.classList.remove('wo-mild');
            }
            storage.set('mild-mode', String(next));
        });
    }

    // 初期ロード時はLocalStorageへの自動保存を行わない
    updateWoCount(false);

    // 言語変更の検知
    onLanguageChange(() => {
        if (woSection) applyTranslations(woSection);
        if (storage.get('text') === null) {
            woInput.value = t('tool.weightOver.sample');
            updateWoCount(false);
        }
    });
}