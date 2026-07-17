// 管理アプリ用Service Worker。
// キャッシュはせず常にネットワークへ（チャットは常に最新である必要があるため）。
// プッシュ通知(FCM)のバックグラウンド受信もここで処理する。
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
importScripts('config.js');

firebase.initializeApp(CUPIDS.firebase);
const messaging = firebase.messaging();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

// アプリを閉じている間の通知表示（サーバーはdata-onlyで送ってくる）
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'キューピッズ', {
    body: d.body || '新しいメッセージが届いています',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.conversationId || 'moji-chat', // 同じ会話の通知は積み重ねない
    data: d
  });
});

// 通知タップ → 通知が指すページを開く（既に開いていればそこへ）
// 文字数チャット=admin.html / 100文字チャット=cupids-sevenのロビー（data.urlで指定）
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './admin.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url === url && 'focus' in c) return c.focus();
        if (url.includes('admin.html') && c.url.includes('admin.html') && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
