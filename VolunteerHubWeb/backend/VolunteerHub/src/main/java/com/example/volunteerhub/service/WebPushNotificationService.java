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

    public void sendNotificationToUser(Long userId, String title, String body) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAllByUserId(userId);
        for (PushSubscription subscription : subscriptions) {
            try {
                sendPush(subscription, title, body);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void sendNotificationToAll(String title, String body) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAll();
        for (PushSubscription subscription : subscriptions) {
            try {
                sendPush(subscription, title, body);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void sendPush(PushSubscription subscription, String title, String body) throws Exception {
        String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\"}", title, body);

        Notification notification = new Notification(
                subscription.getEndpoint(),
                subscription.getPublicKey(),
                subscription.getAuthKey(),
                payload.getBytes(StandardCharsets.UTF_8)
        );

        PushService pushService = new PushService();
        // Load VAPID keys into Key objects and set them on PushService
        pushService.setPublicKey(Utils.loadPublicKey(publicKey.trim()));
        pushService.setPrivateKey(Utils.loadPrivateKey(privateKey.trim()));
        pushService.setSubject(subject);

        pushService.send(notification);
    }
}
