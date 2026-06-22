// App Shell: テーマ / サイドバー / ツール切替
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

    // ツール切り替え
    const toolLinks = document.querySelectorAll('.tool-link');
    const toolSections = document.querySelectorAll('.tool-section');

    const switchTool = (targetTool) => {
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

        toolSections.forEach(section => {
            section.classList.remove('active');
        });
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
}