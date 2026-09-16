/**
 * 上限設定コントロール共通モジュール (Limit Controls)
 * ステップ加減算ボタン（+-）およびクイック上限プリセットボタン（数字）の制御
 */

/**
 * 現在値に対してステップ値を加減算し、指定の最小値・最大値の範囲内に収めて返す
 * @param {number|string} currentValue 現在の値
 * @param {number|string} step 加減算する値（例: 10, 100, -10, -100）
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @returns {number} 計算後の値
 */
export function calculateStepValue(currentValue, step, min = 1, max = 50000) {
    let current = parseInt(currentValue, 10);
    if (isNaN(current)) {
        current = min;
    }
    const stepNum = parseInt(step, 10) || 0;
    const nextVal = current + stepNum;
    return Math.min(max, Math.max(min, nextVal));
}

/**
 * ステップ加減算ボタン（.btn-step）のイベントリスナーを設定する
 * @param {HTMLElement} container ボタン群を含む親要素
 * @param {HTMLInputElement} inputEl 対象のinput要素
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @param {Function} [onChange] 値変更時のコールバック
 */
export function setupStepButtons(container, inputEl, min = 1, max = 50000, onChange = null) {
    if (!container || !inputEl) return;
    const buttons = container.querySelectorAll('.btn-step');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const step = btn.getAttribute('data-step');
            if (step === null || step === undefined) return;
            const newVal = calculateStepValue(inputEl.value, step, min, max);
            inputEl.value = newVal;
            if (typeof onChange === 'function') {
                onChange(newVal);
            }
        });
    });
}

/**
 * クイック上限プリセットボタン（.quick-limit-btn）のイベントリスナーを設定する
 * @param {HTMLElement} container ボタン群を含む親要素
 * @param {HTMLInputElement} inputEl 対象のinput要素
 * @param {Function} [onChange] 値変更時のコールバック
 */
export function setupQuickLimitButtons(container, inputEl, onChange = null) {
    if (!container || !inputEl) return;
    const buttons = container.querySelectorAll('.quick-limit-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const limit = btn.getAttribute('data-limit');
            if (!limit) return;
            inputEl.value = limit;
            if (typeof onChange === 'function') {
                onChange(parseInt(limit, 10));
            }
        });
    });
}

/**
 * ステップボタンとクイックボタンの両方をまとめて設定する
 * @param {Object} options
 * @param {HTMLElement} options.container 親コンテナ
 * @param {HTMLInputElement} options.inputEl 対象のinput要素
 * @param {number} [options.min=1] 最小値
 * @param {number} [options.max=50000] 最大値
 * @param {Function} [options.onChange] 値変更時のコールバック
 */
export function setupLimitControls({ container, inputEl, min = 1, max = 50000, onChange = null }) {
    if (!container || !inputEl) return;
    setupStepButtons(container, inputEl, min, max, onChange);
    setupQuickLimitButtons(container, inputEl, onChange);
}
