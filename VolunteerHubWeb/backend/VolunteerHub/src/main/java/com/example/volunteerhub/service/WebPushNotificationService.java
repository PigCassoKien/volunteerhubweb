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
import java.security.Security;
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

    // send with explicit url (recommended)
    public void sendNotificationToUser(Long userId, String title, String body, String url) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAllByUserId(userId);
        for (PushSubscription subscription : subscriptions) {
            try {
                sendPush(subscription, title, body, url);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // legacy compatibility: no url
    public void sendNotificationToUser(Long userId, String title, String body) {
        sendNotificationToUser(userId, title, body, "/");
    }

    public void sendNotificationToAll(String title, String body, String url) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAll();
        for (PushSubscription subscription : subscriptions) {
            try {
                sendPush(subscription, title, body, url);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // legacy compatibility
    public void sendNotificationToAll(String title, String body) {
        sendNotificationToAll(title, body, "/");
    }

    private void sendPush(PushSubscription subscription, String title, String body, String url) throws Exception {
        // include url in payload so sw.js can open correct page on click
        String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\",\"url\":\"%s\"}",
                escapeJson(title), escapeJson(body), escapeJson(url == null ? "/" : url));

        Notification notification = new Notification(
                subscription.getEndpoint(),
                subscription.getPublicKey(),
                subscription.getAuthKey(),
                payload.getBytes(StandardCharsets.UTF_8)
        );

        PushService pushService = new PushService();
        pushService.setPublicKey(Utils.loadPublicKey(publicKey.trim()));
        pushService.setPrivateKey(Utils.loadPrivateKey(privateKey.trim()));
        pushService.setSubject(subject);

        pushService.send(notification);
    }

    private String escapeJson(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
