const webpush = require('web-push');

// VAPID từ application.properties
const VAPID = {
  publicKey: 'BBaLZ87GwW4SMSoMQ1TYaAVGoqgkZRL-BOjUBdh4Fy0ag_dgXAy1GQff-7Q8RMRC7IHqwGY3d5QjmXZOI11jNGM',
  privateKey: 'Cwx3S0hD6eXkj_pq3w3UXOOpuw3d3uFGcJJn4qhY3z0',
  subject: 'mailto:kien0610minh@gmail.com'
};
webpush.setVapidDetails(VAPID.subject, VAPID.publicKey, VAPID.privateKey);

// PASTE subscription JSON từ trình duyệt (copy exactly)
const sub = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/dE1PGslD13A:APA91bHcHSGUlB9gd918u0Np_woSRQKwwBH3dYpsc68HfVvOK_bl4UyO84xoodoyP-ino1hjuVbBSBOSZLTFhSKpotGXqEcJuILSlVXNPgblnmXOyIZEgpFO7APKx9fXzIdGvQR-idoY',
  keys: {
    p256dh: 'BLRPYsJQl1LO8D60j-T9csTjZSPEFXH7uisBs7M632dj_6X3Yl5jdNEPe1F8ofYS6qDvz6Zttkh-qSLccKxo2xE',
    auth: '8qxZnRF6TQyCfQu5h8yo-Q'
  }
};

(async () => {
  try {
    const payload = JSON.stringify({ title: 'Test', body: 'Web-push test', url: '/' });
    await webpush.sendNotification(sub, payload, { TTL: 60 });
    console.log('Sent ok');
  } catch (err) {
    console.error('Send error:', err.statusCode || err.body || err.message || err);
  }
})();