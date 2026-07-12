import { initShell } from './app/shell.js';

const PENDING_FILE_KEY = 'os-pending-file';

// Web Share Target 等で IndexedDB に保存されたファイルを消費する関数
async function consumeSharedFile() {
    return new Promise((resolve) => {
        const request = indexedDB.open('ArtifactPlaygroundDB', 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore('shared_files');
        };
        request.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('shared_files')) {
                resolve();
                return;
            }
            const tx = db.transaction('shared_files', 'readwrite');
            const store = tx.objectStore('shared_files');
            const getReq = store.get('latest_shared_file');

            getReq.onsuccess = () => {
                const fileData = getReq.result;
                if (fileData) {
                    store.delete('latest_shared_file');
                    sessionStorage.setItem(PENDING_FILE_KEY, JSON.stringify({
                        name: fileData.name,
                        content: fileData.content,
                    }));
                    if (!window.location.hash.includes('outline-studio')) {
                        window.location.hash = 'outline-studio';
                    } else {
                        window.dispatchEvent(new CustomEvent('os-pending-file'));
                    }
                }
                resolve();
            };
        };
        request.onerror = () => resolve();
    });
}

function initLaunchQueue() {
    if (!('launchQueue' in window)) return;

    window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files?.length) return;

        try {
            const file = await launchParams.files[0].getFile();
            const content = await file.text();
            sessionStorage.setItem(PENDING_FILE_KEY, JSON.stringify({
                name: file.name,
                content,
            }));

            if (!window.location.hash.includes('outline-studio')) {
                window.location.hash = 'outline-studio';
            } else {
                window.dispatchEvent(new CustomEvent('os-pending-file'));
            }
        } catch (err) {
            console.error('Failed to load launched file:', err);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initLaunchQueue();
    await consumeSharedFile();
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