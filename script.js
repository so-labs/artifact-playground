document.addEventListener('DOMContentLoaded', () => {
    // テーマ切り替え機能
    const themeSettingsBtn = document.getElementById('theme-settings-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');

    let currentThemeSetting = localStorage.getItem('app-theme') || 'system';

    const applyTheme = (setting) => {
        let isDark = false;
        if (setting === 'dark') {
            isDark = true;
        } else if (setting === 'light') {
            isDark = false;
        } else {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        themeOptions.forEach(opt => {
            if (opt.getAttribute('data-value') === setting) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    };

    // 初期状態の反映
    applyTheme(currentThemeSetting);

    // ロード時のアニメーションちらつき防止のため、少し遅延させて transition 用クラスを追加
    setTimeout(() => {
        document.body.classList.add('theme-ready');
    }, 100);

    // テーマ設定メニューの開閉
    if (themeSettingsBtn && themeMenu) {
        themeSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!themeMenu.contains(e.target) && !themeSettingsBtn.contains(e.target)) {
                themeMenu.classList.remove('show');
            }
        });

        themeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.getAttribute('data-value');
                currentThemeSetting = val;
                localStorage.setItem('app-theme', val);
                applyTheme(val);
                themeMenu.classList.remove('show');
            });
        });
    }

    // OSのテーマ設定変更を監視
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentThemeSetting === 'system') {
            applyTheme('system');
        }
    });

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
    });

    // クリップボードへコピー
    let copyResetTimer = null;
    btnCopy.addEventListener('click', async () => {
        const textToCopy = outputText.value;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            if (copyResetTimer) clearTimeout(copyResetTimer);
            btnCopy.textContent = 'コピー完了！';
            copyResetTimer = setTimeout(() => {
                btnCopy.textContent = 'コピー';
                copyResetTimer = null;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('クリップボードへのコピーに失敗しました。');
        }
    });
});