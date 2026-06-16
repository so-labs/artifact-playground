// Tool: ウエイトオーバー
export function initToolWeightOver() {
    const woInput = document.getElementById('wo-input');
    const woLimitInput = document.getElementById('wo-limit');
    const woCountEl = document.getElementById('wo-count');
    const woLimitDisplay = document.getElementById('wo-limit-display');
    const woCounter = document.getElementById('wo-counter');
    const woSection = document.getElementById('tool-weight-over');

    if (!woInput || !woLimitInput) return;

    const updateWoCount = () => {
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
    };

    woInput.addEventListener('input', updateWoCount);
    woLimitInput.addEventListener('input', updateWoCount);
    updateWoCount();
}