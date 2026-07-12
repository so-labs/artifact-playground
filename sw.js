const CACHE_NAME = 'artifact-playground-v2';
const ASSETS = [
  './',
  './index.html',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/main.js',
  './js/app/shell.js',
  './js/lib/storage.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './tools/20-off/20-off.html',
  './tools/20-off/20-off.css',
  './tools/20-off/20-off.js',
  './tools/norinori-note/norinori-note.html',
  './tools/norinori-note/norinori-note.css',
  './tools/norinori-note/norinori-note.js',
  './tools/slice-drop/slice-drop.html',
  './tools/slice-drop/slice-drop.css',
  './tools/slice-drop/slice-drop.js',
  './tools/weight-over/weight-over.html',
  './tools/weight-over/weight-over.css',
  './tools/weight-over/weight-over.js',
  './js/lib/markdown-headings.js',
  './tools/outline-studio/outline-studio.html',
  './tools/outline-studio/outline-studio.css',
  './tools/outline-studio/outline-studio.js'
];

// インストール時に静的キャッシュを取得
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 有効化時に古いキャッシュを整理
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Shared File などを IndexedDB に保存するためのヘルパー
function saveSharedFile(fileData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ArtifactPlaygroundDB', 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('shared_files');
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('shared_files', 'readwrite');
      const store = tx.objectStore('shared_files');
      store.put(fileData, 'latest_shared_file');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

// キャッシュ優先（オフライン対応）のフェッチ戦略と Share Target の傍受
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Web Share Target API による POST リクエストのハンドリング
  if (event.request.method === 'POST' && url.search.includes('share-target')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('shared_file');
        const text = formData.get('text');

        let fileData = null;
        if (file && file.size > 0) {
          const content = await file.text();
          fileData = { name: file.name, content: content };
        } else if (text) {
          fileData = { name: 'shared.md', content: text };
        }

        if (fileData) {
          await saveSharedFile(fileData);
        }

        // 保存完了後、アプリの特定ルートへリダイレクト
        return Response.redirect('./#outline-studio', 303);
      } catch (err) {
        console.error('Share target processing error:', err);
        return Response.redirect('./', 303);
      }
    })());
    return;
  }

  // 通常のキャッシュ優先ロジック
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});