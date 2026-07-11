// PWAインストール要件を満たすための最小Service Worker。
// キャッシュはせず常にネットワークへ（チャットは常に最新である必要があるため）。
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
