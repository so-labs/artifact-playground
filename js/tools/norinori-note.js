// Tool: ノリノリ音符
export function initToolNorinoriNote() {
    const inputEl = document.getElementById('nn-input');
    const outputEl = document.getElementById('nn-output');
    const btnConvert = document.getElementById('nn-btn-convert');
    const btnClear = document.getElementById('nn-btn-clear');
    const btnCopy = document.getElementById('nn-btn-copy');

    if (!inputEl || !btnConvert) return;

    // LocalStorageから状態を復元
    const savedText = localStorage.getItem('nn-text');
    if (savedText) {
        inputEl.value = savedText;
    }

    // 入力テキストの変更を保存
    inputEl.addEventListener('input', () => {
        localStorage.setItem('nn-text', inputEl.value);
    });

    const notes = ['♪', '♫', '♬'];

    const getRandomNote = () => {
        return notes[Math.floor(Math.random() * notes.length)];
    };

    // ノリノリにする処理
    btnConvert.addEventListener('click', () => {
        let text = inputEl.value;
        if (!text) return;

        // 1. 文頭と文末の余白や改行を削除
        text = text.trim();

        // 2. 改行コードの統一 (\r\n や \r を \n に)
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // 3. 連続する改行コードを1つにまとめる
        text = text.replace(/\n+/g, '\n');
        
        if (!text) {
            outputEl.value = '';
            return;
        }

        // 4. 行に分割して、それぞれの末尾にランダムな音符を追加して結合
        const lines = text.split('\n');
        const processed = lines.map(line => line + getRandomNote()).join('');

        outputEl.value = processed;
    });

    // 入力・出力エリアのクリア
    btnClear.addEventListener('click', () => {
        inputEl.value = '';
        outputEl.value = '';
        localStorage.removeItem('nn-text');
    });

    // クリップボードへコピー
    let copyResetTimer = null;
    btnCopy.addEventListener('click', async () => {
        const textToCopy = outputEl.value;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            if (copyResetTimer) clearTimeout(copyResetTimer);
            btnCopy.textContent = 'コピー完了！';
            copyResetTimer = setTimeout(() => {
                btnCopy.textContent = 'コピー';
                copyResetTimer = null;
            }, 1000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('クリップボードへのコピーに失敗しました。');
        }
    });
}