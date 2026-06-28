// Tool: 20% Off
import { createToolStorage, copyToClipboard } from '../../js/lib/storage.js';

export default function init() {
    const btnReduce = document.getElementById('btn-reduce');
    const btnClear = document.getElementById('btn-clear');
    const btnCopy = document.getElementById('btn-copy');
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const percentSlider = document.getElementById('percent-slider');
    const percentDisplay = document.getElementById('percent-display');

    if (!btnReduce || !inputText) return;

    // スライダーの充填割合をCSS変数に反映する関数
    const updateSliderFill = (slider) => {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--slider-fill', `${pct.toFixed(1)}%`);
    };

    const storage = createToolStorage('20off');

    // LocalStorageから状態を復元
    const savedPercent = storage.get('percent');
    if (savedPercent) {
        percentSlider.value = savedPercent;
        percentDisplay.textContent = savedPercent;
        btnReduce.textContent = `${savedPercent}%削る`;
    }
    // 初期値をCSS変数に反映
    updateSliderFill(percentSlider);
    const savedText = storage.get('text');
    if (savedText) {
        inputText.value = savedText;
    }

    // 入力テキストの変更を保存
    inputText.addEventListener('input', () => {
        storage.set('text', inputText.value);
    });

    // スライダーの表示とボタンのテキストを連動
    percentSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        percentDisplay.textContent = val;
        btnReduce.textContent = `${val}%削る`;
        storage.set('percent', val);
        updateSliderFill(percentSlider);
    });

    // 「削る」処理ロジック
    btnReduce.addEventListener('click', () => {
        const text = inputText.value;
        if (!text) return;

        const percent = parseInt(percentSlider.value, 10) / 100;
        const lines = text.split('\n');
        const processedLines = lines.map(line => {
            // 絵文字などのサロゲートペアを正しく1文字として扱うために Array.from を使用
            const chars = Array.from(line);
            const N = chars.length;

            if (N === 0) return ''; // 空行はそのまま

            // 削る文字数を算出 (指定割合・切り捨て)
            let D = Math.floor(N * percent);

            // 短文対策: 2文字以上ある場合は最低1文字は削除
            if (D === 0 && N > 1) {
                D = 1;
            }

            if (D === 0) return line; // 削る文字がない場合はそのまま

            // 先頭1文字は削除対象から除外するため、削除可能上限を調整
            D = Math.min(D, N - 1);

            // 削除するインデックスをランダムに決定
            const indicesToRemove = new Set();
            while (indicesToRemove.size < D) {
                // 先頭文字(0)を除外し、1〜N-1から選択
                const randIndex = Math.floor(Math.random() * (N - 1)) + 1;
                indicesToRemove.add(randIndex);
            }

            // 削除対象以外の文字を抽出して再結合
            const resultChars = chars.filter((_, index) => !indicesToRemove.has(index));
            return resultChars.join('');
        });

        // 処理結果を改行で結合して出力エリアへ
        outputText.value = processedLines.join('\n');
    });

    // 入力・出力エリアのクリア
    btnClear.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        storage.remove('text');
    });

    // クリップボードへコピー
    btnCopy.addEventListener('click', () => {
        copyToClipboard(outputText.value, btnCopy);
    });
}