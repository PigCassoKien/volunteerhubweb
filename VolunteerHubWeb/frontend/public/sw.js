/* Service Worker - push handler
   - Robust payload parsing (json or text)
   - Show richer, nicer notification layout (title, body, image, badge, actions)
*/

function safeParsePushData(event) {
  const defaultData = { title: 'VolunteerHub', body: '', url: '/', tag: undefined };
  if (!event.data) return defaultData;
  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch (e) {
      return null;
    }
  };

  try {
    const parsed = event.data.json();
    if (parsed && typeof parsed === 'object') {
      // If some fields are themselves JSON strings, try to unwrap them
      const copy = { ...defaultData, ...parsed };
      if (typeof copy.body === 'string') {
        const inner = tryParse(copy.body);
        if (inner && typeof inner === 'object') Object.assign(copy, inner);
      }
      if (typeof copy.title === 'string') {
        const innerT = tryParse(copy.title);
        if (innerT && typeof innerT === 'object') Object.assign(copy, innerT);
      }
      return copy;
    }
    return { ...defaultData, body: String(parsed) };
  } catch (e) {
    try {
      const text = event.data.text();
      const parsed = tryParse(text);
      if (parsed && typeof parsed === 'object') return { ...defaultData, ...parsed };
      // also try to see if text contains an embedded JSON object
      const maybeJsonStart = text.indexOf('{');
      if (maybeJsonStart >= 0) {
        const substr = text.slice(maybeJsonStart);
        const parsedInner = tryParse(substr);
        if (parsedInner && typeof parsedInner === 'object') return { ...defaultData, ...parsedInner };
      }
      return { ...defaultData, body: text };
    } catch (e3) {
      return defaultData;
    }
  }
}

self.addEventListener('push', (event) => {
  const data = safeParsePushData(event);

  const title = data.title || 'VolunteerHub';
  const body = data.body || '';
  const url = data.url || '/';

  const options = {
    // Build a friendly, multi-line body if structured content available
    body: buildNotificationBody(data),
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/logo192.png',
    image: data.image || undefined,
    tag: data.tag || `vh-${data.eventId || Date.now()}`,
    renotify: true,
    vibrate: [100, 50, 100],
    timestamp: Date.now(),
    data: { url, payload: data },
    actions: data.url ? [
      { action: 'open', title: 'Mở', icon: '/icons/open.png' },
      { action: 'dismiss', title: 'Đóng', icon: '/icons/close.png' }
    ] : []
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const url = event.notification.data?.url || '/';

  if (action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// helper: compose a friendly body text from structured payload
function buildNotificationBody(data) {
  // Prefer explicit content fields
  if (data.preview) return data.preview;
  const parts = [];
  if (data.subtitle) parts.push(data.subtitle);
  if (data.eventTitle) parts.push(`Sự kiện: ${data.eventTitle}`);
  if (data.organizer) parts.push(`Ban tổ chức: ${data.organizer}`);
  if (data.body && typeof data.body === 'string') {
    // If body looks like JSON serialized string, try to parse
    const trimmed = data.body.trim();
    if ((trimmed.startsWith('{') || trimmed.startsWith('['))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          if (parsed.content) parts.push(parsed.content);
          else parts.push(JSON.stringify(parsed));
        }
      } catch (e) {
        parts.push(data.body);
      }
    } else {
      parts.push(data.body);
    }
  }
  // Fallback: single-line summary
  if (parts.length === 0 && data.title) return data.title;
  return parts.join('\n');
}
