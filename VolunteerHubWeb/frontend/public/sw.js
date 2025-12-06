self.addEventListener('push', function (event) {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Thông báo';
    const options = {
      body: data.body || '',
      icon: data.icon || '/favicon.ico',
      data: data.url || '/',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // fallback text
    event.waitUntil(self.registration.showNotification('Thông báo', { body: event.data ? event.data.text() : '' }));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(clients.openWindow(url));
});