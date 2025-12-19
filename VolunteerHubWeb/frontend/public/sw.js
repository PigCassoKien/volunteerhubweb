/* Service Worker - push handler
   - robustly parse event.data as JSON or text
   - show notification with title/body/url
*/

self.addEventListener('push', event => {
  let data = { title: 'Thông báo', body: '', url: '/' };

  if (event.data) {
    try {
      const parsed = event.data.json();
      if (parsed && typeof parsed === 'object') {
        data.title = parsed.title || data.title;
        data.body = parsed.body || '';
        data.url = parsed.url || '/';
      } else {
        data.body = String(parsed);
      }
      console.log('[SW] push received (json)', parsed);
    } catch (err) {
      try {
        const text = event.data.text();
        try {
          const parsedText = JSON.parse(text);
          data.title = parsedText.title || data.title;
          data.body = parsedText.body || text;
          data.url = parsedText.url || '/';
          console.log('[SW] push received (text -> json)', parsedText);
        } catch (e2) {
          data.body = text;
          console.log('[SW] push received (text)', text);
        }
      } catch (e3) {
        console.warn('[SW] push event contains data but could not be read', e3);
      }
    }
  }

  const options = {
    body: data.body || '',
    data: { url: data.url || '/' },
    icon: '/logo192.png'
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
self.addEventListener('push', event => {
  let data = { title: 'Thông báo', body: '', url: '/' };
    if (event.data) {
      try {
        // Prefer structured JSON payload
        data = event.data.json();
        console.log('[sw] push received payload (json):', data);
      } catch (e1) {
        try {
          // Fallback: some endpoints deliver text payloads
          const text = event.data.text();
          // try parse as JSON, otherwise treat as plain body
          try {
            const parsed = JSON.parse(text);
            data = parsed;
            console.log('[sw] push received payload (parsed text->json):', data);
          } catch (e2) {
            data.body = text;
            console.log('[sw] push received payload (text):', text);
          }
        } catch (e3) {
          console.error('[sw] failed to read payload', e3);
        }
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
