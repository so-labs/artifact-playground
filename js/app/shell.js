// App Shell: テーマ / サイドバー / ツール切替

// ツールのメタデータを一元管理する定義リスト
const TOOLS_CONFIG = [
    { id: '20-off', title: '20% Off' },
    { id: 'weight-over', title: 'ウエイトオーバー' },
    { id: 'norinori-note', title: 'ノリノリ音符' }
];

export function initShell() {
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
                    link.href = `css/tools/${targetTool}.css`;
                    document.head.appendChild(link);
                }

                // 1. HTMLを非同期ロード
                const response = await fetch(`views/${targetTool}.html`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const html = await response.text();
                
                // 2. DOMに追加
                mainContent.insertAdjacentHTML('beforeend', html);
                
                // 3. JSモジュールを動的インポートして default関数 を実行
                const module = await import(`../tools/${targetTool}.js`);
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