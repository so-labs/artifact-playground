// 確認モーダル（ブラウザ標準の confirm() の代替）
// サイト共通のデザインで統一するため、DOMはこのモジュールが動的に生成する。
// 使い方: const ok = await showConfirmDialog({ title, message, confirmText, cancelText, danger: true });

const DANGER_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';

// 表示中のモーダルを閉じるための関数（開いていなければ null）
let closeActiveDialog = null;

/**
 * 確認モーダルを表示し、ユーザーの選択を Promise で返す
 * @param {Object} [options]
 * @param {string} [options.title] 見出し
 * @param {string} [options.message] 本文（\n は改行として表示される）
 * @param {string} [options.confirmText] 実行ボタンの文言
 * @param {string} [options.cancelText] キャンセルボタンの文言
 * @param {boolean} [options.danger] 削除などの危険な操作かどうか（アイコンと実行ボタンの色、初期フォーカスが変わる）
 * @returns {Promise<boolean>} 実行ボタンで true、それ以外（キャンセル・背景クリック・Esc）で false
 */
export function showConfirmDialog(options = {}) {
    const {
        title = '',
        message = '',
        confirmText = 'OK',
        cancelText = 'Cancel',
        danger = false,
    } = options;

    // すでに開いているものがあれば、キャンセル扱いで閉じてから開き直す
    if (closeActiveDialog) {
        closeActiveDialog(false);
    }

    return new Promise((resolve) => {
        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        const overlay = document.createElement('div');
        overlay.className = 'confirm-modal';

        const card = document.createElement('div');
        card.className = 'confirm-modal-card';
        card.setAttribute('role', 'alertdialog');
        card.setAttribute('aria-modal', 'true');
        if (title) card.setAttribute('aria-label', title);

        if (danger) {
            const icon = document.createElement('div');
            icon.className = 'confirm-modal-icon';
            icon.innerHTML = DANGER_ICON;
            card.appendChild(icon);
        }

        if (title) {
            const titleEl = document.createElement('h2');
            titleEl.className = 'confirm-modal-title';
            titleEl.textContent = title;
            card.appendChild(titleEl);
        }

        if (message) {
            const messageEl = document.createElement('p');
            messageEl.className = 'confirm-modal-message';
            messageEl.textContent = message;
            card.appendChild(messageEl);
        }

        const actions = document.createElement('div');
        actions.className = 'confirm-modal-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn confirm-modal-cancel';
        cancelBtn.textContent = cancelText;

        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = danger ? 'btn confirm-modal-danger' : 'btn primary';
        confirmBtn.textContent = confirmText;

        actions.appendChild(cancelBtn);
        actions.appendChild(confirmBtn);
        card.appendChild(actions);
        overlay.appendChild(card);

        const onKeydown = (e) => {
            if (e.key === 'Escape') {
                close(false);
            }
        };

        const close = (result) => {
            document.removeEventListener('keydown', onKeydown, true);
            document.body.style.overflow = previousOverflow || '';
            overlay.remove();
            if (closeActiveDialog === close) {
                closeActiveDialog = null;
            }
            // 開く前にフォーカスがあった要素へ戻す
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                previouslyFocused.focus();
            }
            resolve(result);
        };
        closeActiveDialog = close;

        cancelBtn.addEventListener('click', () => close(false));
        confirmBtn.addEventListener('click', () => close(true));
        // 背景（カードの外側）クリックでもキャンセル扱いで閉じる
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                close(false);
            }
        });
        document.addEventListener('keydown', onKeydown, true);

        document.body.style.overflow = 'hidden';
        document.body.appendChild(overlay);

        // 表示直後にクラスを付けて、ふわりと開くアニメーションを効かせる
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        // 危険な操作では誤操作防止のためキャンセルを初期フォーカスにする
        (danger ? cancelBtn : confirmBtn).focus();
    });
}
