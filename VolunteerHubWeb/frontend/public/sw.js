self.addEventListener('push', event => {
  let data = { title: 'Thông báo', body: '', url: '/' };
  if (event.data) {
      try {
          data = event.data.json();
          console.log('[sw] push received payload:', data);
      } catch(e) {
          console.error('[sw] failed to parse payload', e);
      }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Thông báo', {
      body: data.body || '',
      data: { url: data.url || '/' }, // phải là object
      icon: '/icons/icon-192x192.png', // optional
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
