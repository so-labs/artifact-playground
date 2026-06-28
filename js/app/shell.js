// App Shell: テーマ / サイドバー / ツール切替

// ============================
// アクセントカラーアニメーション
// ============================

// ライトテーマ: 青 #2563eb (HSL 220,84%,54%) <-> オレンジ #ea580c (HSL 24,88%,48%)
// ダークテーマ: 青 #3b82f6 (HSL 217,91%,60%) <-> オレンジ #f97316 (HSL 25,95%,53%)
const ACCENT_COLORS = {
    light: {
        blue: { h: 220, s: 84, l: 54 },
        blueHover: { h: 220, s: 84, l: 43 },
        orange: { h: 24, s: 88, l: 48 },
        orangeHover: { h: 24, s: 88, l: 38 },
    },
    dark: {
        blue: { h: 217, s: 91, l: 60 },
        blueHover: { h: 217, s: 91, l: 73 },
        orange: { h: 25, s: 95, l: 53 },
        orangeHover: { h: 25, s: 95, l: 61 },
    }
};

// サイクル設定
// 1サイクル = ホールド × 2 + 遷移 × 2
const HOLD_MS = 5000; // 各色で止まっている時間
const TRANS_MS = 2000; // 色の遷移にかかる時間
const CYCLE_MS = (HOLD_MS + TRANS_MS) * 2; // 合計14秒

let accentAnimFrameId = null;
let accentAnimStartTime = null;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function hslStr(h, s, l) {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function lerpColor(c1, c2, t) {
    return {
        h: lerp(c1.h, c2.h, t),
        s: lerp(c1.s, c2.s, t),
        l: lerp(c1.l, c2.l, t),
    };
}

// smoothstep: 入力0〜1を滑らかなS字カーブで変換
function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

// 経過時間から補間係数 t（0=青, 1=オレンジ）を算出する区分関数
// 区間: [青ホールド] → [青→オレンジ遷移] → [オレンジホールド] → [オレンジ→青遷移]
function getAccentT(elapsed) {
    const phase = (elapsed % CYCLE_MS); // 0 〜 CYCLE_MS

    if (phase < HOLD_MS) {
        // 青でホールド
        return 0;
    } else if (phase < HOLD_MS + TRANS_MS) {
        // 青 → オレンジ へ遷移
        return smoothstep((phase - HOLD_MS) / TRANS_MS);
    } else if (phase < HOLD_MS + TRANS_MS + HOLD_MS) {
        // オレンジでホールド
        return 1;
    } else {
        // オレンジ → 青 へ遷移
        return 1 - smoothstep((phase - HOLD_MS - TRANS_MS - HOLD_MS) / TRANS_MS);
    }
}

function applyAccentColors(primaryColor, primaryHover) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-hover', primaryHover);
}

function resetAccentToBlue() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = isDark ? ACCENT_COLORS.dark : ACCENT_COLORS.light;
    applyAccentColors(hslStr(colors.blue.h, colors.blue.s, colors.blue.l),
        hslStr(colors.blueHover.h, colors.blueHover.s, colors.blueHover.l));
}

function tickAccentAnimation(timestamp) {
    if (!accentAnimStartTime) accentAnimStartTime = timestamp;
    const elapsed = timestamp - accentAnimStartTime;

    const t = getAccentT(elapsed);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = isDark ? ACCENT_COLORS.dark : ACCENT_COLORS.light;

    const primary = lerpColor(colors.blue, colors.orange, t);
    const hover = lerpColor(colors.blueHover, colors.orangeHover, t);

    applyAccentColors(hslStr(primary.h, primary.s, primary.l),
        hslStr(hover.h, hover.s, hover.l));

    accentAnimFrameId = requestAnimationFrame(tickAccentAnimation);
}

function startAccentAnimation() {
    if (accentAnimFrameId) return;
    accentAnimStartTime = null;
    accentAnimFrameId = requestAnimationFrame(tickAccentAnimation);
}

function stopAccentAnimation() {
    if (accentAnimFrameId) {
        cancelAnimationFrame(accentAnimFrameId);
        accentAnimFrameId = null;
    }
    resetAccentToBlue();
}

// ============================

// ツールのメタデータを一元管理する定義リスト
const TOOLS_CONFIG = [
    { id: '20-off', title: '20% Off' },
    { id: 'weight-over', title: 'ウエイトオーバー' },
    { id: 'slice-drop', title: 'スライスドロップ' },
    { id: 'norinori-note', title: 'ノリノリ音符' }
];

export function initShell() {
    // テーマ切り替え機能
    const themeSettingsBtn = document.getElementById('theme-settings-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const accentToggleBtn = document.getElementById('accent-animate-toggle');

    let currentThemeSetting = localStorage.getItem('app-theme') || 'system';

    // アクセントカラーアニメーションの初期状態（デフォルト: オン）
    const savedAccentAnimate = localStorage.getItem('accent-animate');
    let isAccentAnimating = savedAccentAnimate === null ? true : savedAccentAnimate === 'true';

    // トグルUIを同期
    function syncAccentToggleUI() {
        if (accentToggleBtn) {
            accentToggleBtn.setAttribute('aria-checked', isAccentAnimating ? 'true' : 'false');
        }
    }

    // アニメーション初期化
    syncAccentToggleUI();
    if (isAccentAnimating) {
        startAccentAnimation();
    } else {
        resetAccentToBlue();
    }

    // トグルボタンのクリックハンドラ
    if (accentToggleBtn) {
        accentToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isAccentAnimating = !isAccentAnimating;
            localStorage.setItem('accent-animate', isAccentAnimating);
            syncAccentToggleUI();
            if (isAccentAnimating) {
                startAccentAnimation();
            } else {
                stopAccentAnimation();
            }
        });
    }

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
    const appContainer = document.querySelector('.app-container');

    // ツールリストの動的生成
    const toolListContainer = document.getElementById('tool-list');
    if (toolListContainer) {
        TOOLS_CONFIG.forEach(tool => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${tool.id}`;
            a.className = 'tool-link';
            a.setAttribute('data-tool', tool.id);
            a.textContent = tool.title;
            li.appendChild(a);
            toolListContainer.appendChild(li);
        });
    }

    // ツール切り替え
    const toolLinks = document.querySelectorAll('.tool-link');
    const mainContent = document.getElementById('main-content');
    const loadedTools = new Set();

    const switchTool = async (targetTool) => {
        let found = false;
        toolLinks.forEach(l => {
            if (l.getAttribute('data-tool') === targetTool) {
                l.classList.add('active');
                found = true;
            } else {
                l.classList.remove('active');
            }
        });

        if (!found) return; // 該当するツールがなければ何もしない

        // いったん全て非表示
        document.querySelectorAll('.tool-section').forEach(section => {
            section.classList.remove('active');
        });

        // まだロードされていなければ、HTMLとJSを取得して初期化
        if (!loadedTools.has(targetTool)) {
            try {
                // 0. CSSを動的にロード
                const cssId = `css-tool-${targetTool}`;
                if (!document.getElementById(cssId)) {
                    const link = document.createElement('link');
                    link.id = cssId;
                    link.rel = 'stylesheet';
                    link.href = `tools/${targetTool}/${targetTool}.css`;
                    document.head.appendChild(link);
                }

                // 1. HTMLを非同期ロード
                const response = await fetch(`tools/${targetTool}/${targetTool}.html`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const html = await response.text();

                // 2. DOMに追加
                mainContent.insertAdjacentHTML('beforeend', html);

                // 3. JSモジュールを動的インポートして default関数 を実行
                const module = await import(`../../tools/${targetTool}/${targetTool}.js`);
                if (module.default) {
                    module.default();
                }

                loadedTools.add(targetTool);
            } catch (error) {
                console.error(`Failed to load tool: ${targetTool}`, error);
                return;
            }
        }

        // 該当セクションを表示
        const targetSection = document.getElementById(`tool-${targetTool}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // モバイルでメニューを閉じる
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    };

    // 初期ロード時にハッシュからツールを選択
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        switchTool(initialHash);
    } else {
        // ハッシュがない場合は最初のツールを選択
        const firstTool = toolLinks[0]?.getAttribute('data-tool');
        if (firstTool) {
            switchTool(firstTool);
        }
    }

    // ハッシュの変更を検知
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            switchTool(hash);
        }
    });

    // ハンバーガーメニューの開閉（スマホ用）
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // サイドバー折りたたみ（デスクトップ用）
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const savedCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (savedCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
        if (appContainer) appContainer.classList.add('sidebar-collapsed');
    }
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            document.documentElement.classList.toggle('sidebar-collapsed', isCollapsed);
            document.body.classList.toggle('sidebar-collapsed', isCollapsed);
            if (appContainer) appContainer.classList.toggle('sidebar-collapsed', isCollapsed);
            localStorage.setItem('sidebar-collapsed', isCollapsed);
            sidebarToggle.setAttribute('aria-label', isCollapsed ? 'サイドバーを開く' : 'サイドバーを折りたたむ');
        });
    }

    // メニュー外のクリックで閉じる（スマホ用）
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });

    // ヘルプボタンの開閉制御
    if (mainContent) {
        mainContent.addEventListener('click', (e) => {
            const helpBtn = e.target.closest('.help-btn');
            if (helpBtn) {
                const section = helpBtn.closest('.tool-section');
                if (section) {
                    const desc = section.querySelector('.tool-description');
                    if (desc) {
                        const isShown = desc.classList.toggle('show');
                        helpBtn.setAttribute('aria-expanded', isShown ? 'true' : 'false');
                    }
                }
            }
        });
    }
}