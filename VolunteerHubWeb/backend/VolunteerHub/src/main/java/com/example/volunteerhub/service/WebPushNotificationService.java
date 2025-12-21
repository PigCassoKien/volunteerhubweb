// language: java
package com.example.volunteerhub.service;

import com.example.volunteerhub.entity.PushSubscription;
import com.example.volunteerhub.repository.PushSubscriptionRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Utils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.Security;
import java.util.Base64;
import java.util.List;

@Service
public class WebPushNotificationService {

    @Autowired
    private PushSubscriptionRepository subscriptionRepository;

    @Value("${vapid.publicKey}")
    private String publicKey;

    @Value("${vapid.privateKey}")
    private String privateKey;

    @Value("${vapid.subject}")
    private String subject;

    public WebPushNotificationService(PushSubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
        Security.addProvider(new BouncyCastleProvider());
    }

    public void sendNotificationToUser(Long userId, String title, String body, String url) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAllByUserId(userId);
        System.out.println("[WebPush] sendNotificationToUser userId=" + userId + " subs=" + (subscriptions == null ? 0 : subscriptions.size()) + " title=" + title);
        if (subscriptions == null || subscriptions.isEmpty()) return;
        for (PushSubscription subscription : subscriptions) {
            try {
                sendPush(subscription, title, body, url);
            } catch (Exception e) {
                System.err.println("[WebPush] sendNotificationToUser -> sendPush failed for endpoint=" + subscription.getEndpoint() + " : " + e.getMessage());
            }
        }
    }

    public void sendNotificationToAll(String title, String body, String url) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAll();
        System.out.println("[WebPush] sendNotificationToAll subs=" + (subscriptions == null ? 0 : subscriptions.size()) + " title=" + title);
        if (subscriptions == null || subscriptions.isEmpty()) return;
        for (PushSubscription s : subscriptions) {
            try {
                sendPush(s, title, body, url);
            } catch (Exception e) {
                System.err.println("[WebPush] sendNotificationToAll -> sendPush failed for endpoint=" + s.getEndpoint() + " : " + e.getMessage());
            }
        }
    }

    private void sendPush(PushSubscription subscription, String title, String body, String url) throws Exception {
        if (subscription == null) throw new IllegalArgumentException("subscription null");
        if (subscription.getEndpoint() == null || subscription.getEndpoint().isBlank()) {
            System.out.println("[WebPush] skip - endpoint empty");
            return;
        }
        if (subscription.getPublicKey() == null || subscription.getPublicKey().isBlank()
                || subscription.getAuthKey() == null || subscription.getAuthKey().isBlank()) {
            System.out.println("[WebPush] skip - missing keys for endpoint=" + subscription.getEndpoint());
            return;
        }

        String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\",\"url\":\"%s\"}",
                escapeJson(title), escapeJson(body), escapeJson(url == null ? "/" : url));
        int ttl = 60;
        System.out.println("[WebPush] preparing -> endpoint=" + subscription.getEndpoint()
                + " p256dh_len=" + subscription.getPublicKey().length()
                + " auth_len=" + subscription.getAuthKey().length()
                + " payload=" + payload + " ttl=" + ttl);

        PublicKey userPublicKey = Utils.loadPublicKey(subscription.getPublicKey());
        byte[] userAuth = Base64.getUrlDecoder().decode(subscription.getAuthKey());
        byte[] payloadBytes = payload.getBytes(StandardCharsets.UTF_8);

        Notification notification = new Notification(subscription.getEndpoint(), userPublicKey, userAuth, payloadBytes, ttl);

        PushService pushService = new PushService();
        pushService.setPublicKey(Utils.loadPublicKey(publicKey));
        pushService.setPrivateKey(Utils.loadPrivateKey(privateKey));
        pushService.setSubject(subject);

        try {
            pushService.send(notification);
            System.out.println("[WebPush] sent -> endpoint=" + subscription.getEndpoint());
        } catch (Exception ex) {
            System.err.println("[WebPush] send FAILED -> endpoint=" + subscription.getEndpoint() + " : " + ex.getMessage());
            String msg = ex.getMessage() == null ? "" : ex.getMessage();
            if (msg.contains("410") || msg.toLowerCase().contains("gone") || msg.toLowerCase().contains("not found")) {
                try {
                    subscriptionRepository.deleteById(subscription.getId());
                    System.out.println("[WebPush] deleted stale subscription id=" + subscription.getId());
                } catch (Exception e2) {
                    System.err.println("[WebPush] failed to delete stale subscription id=" + subscription.getId() + " : " + e2.getMessage());
                }
            }
            throw ex;
        }
    }

    private String escapeJson(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
