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

// helper: compose a formal, human-friendly body text from structured payload
function stripHtml(s) {
  return String(s || '').replace(/<[^>]*>/g, '').trim();
}

function buildNotificationBody(data) {
  // Prefer an explicit content/message field when present
  const content = data.content || data.message || data.preview;
  if (content) return stripHtml(content);

  // If body is a plain string, use it (cleaned) without prepending key names
  if (typeof data.body === 'string' && data.body.trim().length > 0) {
    return stripHtml(data.body);
  }

  // If body is an object (already parsed), try to extract common fields
  if (data.body && typeof data.body === 'object') {
    if (data.body.content) return stripHtml(data.body.content);
    if (data.body.message) return stripHtml(data.body.message);
  }

  // Compose from known structured pieces when available
  const parts = [];
  if (data.organizer) parts.push(`Ban tổ chức: ${stripHtml(data.organizer)}`);
  if (data.eventTitle) parts.push(`Sự kiện: ${stripHtml(data.eventTitle)}`);
  if (data.subtitle) parts.push(stripHtml(data.subtitle));

  if (parts.length > 0) return parts.join('\n');

  // Last fallback: use title (without key labels)
  if (data.title) return stripHtml(data.title);

  return '';
}
