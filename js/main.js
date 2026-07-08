import { initShell } from './app/shell.js';

document.addEventListener('DOMContentLoaded', () => {
    initShell();
});

// サービスワーカーの登録（PWA対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // GitHub Pagesのサブディレクトリ構成でも適切に機能するよう、相対パスとスコープを定義
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((err) => {
                console.error('ServiceWorker registration failed: ', err);
            });
    });
}