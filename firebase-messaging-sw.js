// FCMが既定で探しに来るService Worker。
// これが無い(404)と、Firebaseの内部処理がメッセージ送信ごと失敗することがあるため必ず置いておく。
// 通知の表示・タップ処理はsw.jsと同等。
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
importScripts('config.js');

firebase.initializeApp(CUPIDS.firebase);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'キューピッズ', {
    body: d.body || '新しいメッセージが届いています',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.conversationId || 'moji-chat',
    data: d
  });
});

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
