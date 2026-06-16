document.addEventListener('DOMContentLoaded', () => {
    // UI 要素の取得
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const btnReduce = document.getElementById('btn-reduce');
    const btnClear = document.getElementById('btn-clear');
    const btnCopy = document.getElementById('btn-copy');
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const percentSlider = document.getElementById('percent-slider');
    const percentDisplay = document.getElementById('percent-display');

    // ハンバーガーメニューの開閉（スマホ用）
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // メニュー外のクリックで閉じる（スマホ用）
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });

    // スライダーの表示とボタンのテキストを連動
    percentSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        percentDisplay.textContent = val;
        btnReduce.textContent = `${val}%削る`;
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
            const D = Math.floor(N * percent);
            
            if (D === 0) return line; // 削る文字がない場合はそのまま

            // 削除するインデックスをランダムに決定
            const indicesToRemove = new Set();
            while (indicesToRemove.size < D) {
                const randIndex = Math.floor(Math.random() * N);
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
    });

    // クリップボードへコピー
    btnCopy.addEventListener('click', async () => {
        const textToCopy = outputText.value;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = btnCopy.textContent;
            btnCopy.textContent = 'コピー完了！';
            setTimeout(() => {
                btnCopy.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('クリップボードへのコピーに失敗しました。');
        }
    });
});