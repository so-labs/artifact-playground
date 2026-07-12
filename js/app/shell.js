// App Shell: テーマ / サイドバー / ツール切替

// ============================
// プライマリーカラーアニメーション
// ============================

// ライトテーマ: 青 #2563eb (HSL 220,84%,54%) <-> オレンジ #ea580c (HSL 24,88%,48%)
// ダークテーマ: 青 #3b82f6 (HSL 217,91%,60%) <-> オレンジ #f97316 (HSL 25,95%,53%)
const PRIMARY_COLORS = {
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
const HOLD_MS = 10000; // 各色で止まっている時間
const TRANS_MS = 2000; // 色の遷移にかかる時間
const CYCLE_MS = (HOLD_MS + TRANS_MS) * 2;

let primaryAnimFrameId = null;
let primaryAnimStartTime = null;

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
function getPrimaryT(elapsed) {
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

function applyPrimaryColors(primaryColor, primaryHover) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--primary-hover', primaryHover);
}

function resetPrimaryToBlue() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = isDark ? PRIMARY_COLORS.dark : PRIMARY_COLORS.light;
    applyPrimaryColors(hslStr(colors.blue.h, colors.blue.s, colors.blue.l),
        hslStr(colors.blueHover.h, colors.blueHover.s, colors.blueHover.l));
}

function tickPrimaryAnimation(timestamp) {
    if (!primaryAnimStartTime) primaryAnimStartTime = timestamp;
    const elapsed = timestamp - primaryAnimStartTime;

    const t = getPrimaryT(elapsed);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = isDark ? PRIMARY_COLORS.dark : PRIMARY_COLORS.light;

    const primary = lerpColor(colors.blue, colors.orange, t);
    const hover = lerpColor(colors.blueHover, colors.orangeHover, t);

    applyPrimaryColors(hslStr(primary.h, primary.s, primary.l),
        hslStr(hover.h, hover.s, hover.l));

    primaryAnimFrameId = requestAnimationFrame(tickPrimaryAnimation);
}

function startPrimaryAnimation() {
    if (primaryAnimFrameId) return;
    primaryAnimStartTime = null;
    primaryAnimFrameId = requestAnimationFrame(tickPrimaryAnimation);
}

function stopPrimaryAnimation() {
    if (primaryAnimFrameId) {
        cancelAnimationFrame(primaryAnimFrameId);
        primaryAnimFrameId = null;
    }
    resetPrimaryToBlue();
}

// ============================

// ツールのメタデータを一元管理する定義リスト
const TOOLS_CONFIG = [
    {
        id: '20-off',
        title: '20% Off',
        description: '入力したテキストから、指定した割合（％）の文字をランダムに削り落とすツール。',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>'
    },
    {
        id: 'weight-over',
        title: 'ウエイトオーバー',
        description: '文字数上限を意識しながら書くためのリアルタイム文字数カウンター。上限に近づくと画面が警告してくれます。',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
    },
    {
        id: 'slice-drop',
        title: 'スライスドロップ',
        description: '長い文章を指定した上限文字数で自動的に分割し、ページごとに切り替えて個別にコピーできるツール。長文の小分け投稿に便利です。',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
    },
    {
        id: 'norinori-note',
        title: 'ノリノリ音符',
        description: '文章の改行を整理して、各フレーズの末尾にランダムな音符をくっつけるツール。文章を強制的に陽気な雰囲気にします。',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>'
    }
];

export function initShell() {
    // テーマ切り替え機能
    const themeSettingsBtn = document.getElementById('theme-settings-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const primaryToggleBtn = document.getElementById('primary-animate-toggle');

    let currentThemeSetting = localStorage.getItem('app-theme') || 'system';

    // プライマリーカラーアニメーションの初期状態（デフォルト: オン）
    const savedPrimaryAnimate = localStorage.getItem('primary-animate');
    let isPrimaryAnimating = savedPrimaryAnimate === null ? true : savedPrimaryAnimate === 'true';

    // トグルUIを同期
    function syncPrimaryToggleUI() {
        if (primaryToggleBtn) {
            primaryToggleBtn.setAttribute('aria-checked', isPrimaryAnimating ? 'true' : 'false');
        }
    }

    // アニメーション初期化
    syncPrimaryToggleUI();
    if (isPrimaryAnimating) {
        startPrimaryAnimation();
    } else {
        resetPrimaryToBlue();
    }

    // トグルボタンのクリックハンドラ
    if (primaryToggleBtn) {
        primaryToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isPrimaryAnimating = !isPrimaryAnimating;
            localStorage.setItem('primary-animate', isPrimaryAnimating);
            syncPrimaryToggleUI();
            if (isPrimaryAnimating) {
                startPrimaryAnimation();
            } else {
                stopPrimaryAnimation();
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
        // ホームリンク
        const homeLi = document.createElement('li');
        const homeA = document.createElement('a');
        homeA.href = `#home`;
        homeA.className = 'tool-link';
        homeA.setAttribute('data-tool', 'home');
        homeA.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 8px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>ホーム';
        homeLi.appendChild(homeA);
        toolListContainer.appendChild(homeLi);

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

    // タイルメニューの動的生成
    const homeTilesContainer = document.getElementById('home-tiles');
    if (homeTilesContainer) {
        TOOLS_CONFIG.forEach(tool => {
            const tile = document.createElement('a');
            tile.href = `#${tool.id}`;
            tile.className = 'home-tile';
            tile.innerHTML = `
                <div class="home-tile-title">
                    ${tool.icon || ''}
                    ${tool.title}
                </div>
                <div class="home-tile-desc">
                    ${tool.description}
                </div>
            `;
            homeTilesContainer.appendChild(tile);
        });
    }

    // ツール切り替え
    const mainContent = document.getElementById('main-content');
    const loadedTools = new Set();

    const switchTool = async (targetTool) => {
        let found = false;
        const toolLinks = document.querySelectorAll('.tool-link');
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
        document.querySelectorAll('.tool-section, .home-section').forEach(section => {
            section.classList.remove('active');
        });

        if (targetTool === 'home') {
            const homeSection = document.getElementById('tool-home');
            if (homeSection) homeSection.classList.add('active');
        } else {
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
        // ハッシュがない場合はホームを選択
        switchTool('home');
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

        // スワイプジェスチャーによるサイドバーの開閉
        let touchStartX = 0;
        let touchStartY = 0;
        const SWIPE_THRESHOLD_X = 60; // スワイプ判定の最小横移動距離（ピクセル）
        const EDGE_THRESHOLD = 40;     // 画面左端からスワイプを検知する開始幅（ピクセル）

        document.addEventListener('touchstart', (e) => {
            if (window.innerWidth > 768) return;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (window.innerWidth > 768) return;
            if (e.changedTouches.length === 0) return;

            const touch = e.changedTouches[0];
            const diffX = touch.clientX - touchStartX;
            const diffY = touch.clientY - touchStartY;

            // 縦方向の移動量が横方向の移動量よりも大きい場合は縦スクロールと判断して無視
            if (Math.abs(diffY) > Math.abs(diffX)) {
                return;
            }

            const isMenuOpen = sidebar.classList.contains('open');

            if (!isMenuOpen) {
                // サイドバーが閉じている場合：左端付近から右方向へのスワイプで開く
                if (touchStartX <= EDGE_THRESHOLD && diffX > SWIPE_THRESHOLD_X) {
                    sidebar.classList.add('open');
                }
            } else {
                // サイドバーが開いている場合：左方向へのスワイプで閉じる
                if (diffX < -SWIPE_THRESHOLD_X) {
                    sidebar.classList.remove('open');
                }
            }
        }, { passive: true });
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