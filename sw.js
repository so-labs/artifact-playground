const CACHE_NAME = 'artifact-playground-v1';
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
  './tools/weight-over/weight-over.js'
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

// キャッシュ優先（オフライン対応）のフェッチ戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});