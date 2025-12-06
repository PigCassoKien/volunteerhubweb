import axios from "../api/axios";

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function initPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  // only init push when user is logged in (token present)
  const token = localStorage.getItem("token");
  if (!token) {
    // no auth -> do not subscribe (backend requires auth)
    return;
  }

  try {
    // request notification permission first
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
    }

    const reg = await navigator.serviceWorker.register('/sw.js');
    // get vapid key from backend
    const res = await axios.get('/notifications/vapid-public-key');
    const publicKey = res.data?.publicKey;
    if (!publicKey) {
      console.warn("VAPID public key not available from server");
      return;
    }

    const subscription = await reg.pushManager.getSubscription()
      || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

    if (subscription) {
      const subJson = subscription.toJSON();
      // ensure keys exist (some browsers/modes may omit keys)
      const payload = {
        endpoint: subJson.endpoint,
        publicKey: subJson.keys?.p256dh || "",
        authKey: subJson.keys?.auth || ""
      };

      try {
        await axios.post('/subscriptions/save', payload);
      } catch (saveErr) {
        console.error("Failed to save push subscription:", saveErr?.response?.data || saveErr);
      }
    }
  } catch (err) {
    console.error('Push init failed', err);
  }
}