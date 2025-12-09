package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.CustomNotificationRequestDTO;
import com.example.volunteerhub.dto.NotificationDTO;
import com.example.volunteerhub.entity.*;
import com.example.volunteerhub.entity.enums.*;
import com.example.volunteerhub.repository.*;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private WebPushNotificationService webPushNotificationService; // <- ensure available

    // Send custom notification (manager -> all APPROVED registrants of event)
    public void sendCustomNotification(CustomNotificationRequestDTO request, String senderEmail) {
        if (request.getEventId() == null || request.getContent() == null || request.getContent().isBlank()) {
            throw new RuntimeException("Missing eventId or content");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String title = "Thông báo sự kiện: " + event.getTitle();
        String body = request.getContent();
        String url = "/events/" + event.getId();

        // lấy tất cả người đã APPROVED cho event
        List<EventRegistration> regs = registrationRepository.findByEventIdAndStatus(event.getId(), RegistrationStatus.APPROVED);
        List<Long> recipientUserIds = regs.stream()
                .map(r -> r.getUser().getId())
                .distinct()
                .collect(Collectors.toList());

        // gửi tới từng người nhận: lưu Notification + gửi webpush
        for (Long uid : recipientUserIds) {
            try {
                Notification notif = new Notification();
                notif.setUser(userRepository.findById(uid).orElse(null));
                notif.setContent(body);
                notif.setCreatedAt(LocalDateTime.now());
                notif.setIsRead(false);
                notif.setType(NotificationType.EVENT_UPDATE);
                notif.setRelatedId(event.getId());
                notif.setRelatedType(RelatedType.EVENT);
                notificationRepository.save(notif);
            } catch (Exception e) {
                // ignore persistence error per recipient
            }
            try {
                webPushNotificationService.sendNotificationToUser(uid, title, body, url);
            } catch (Exception ex) {
                System.err.println("[WebPush] sendCustomNotification -> send failed for userId=" + uid + " : " + ex.getMessage());
            }
        }

        // nếu yêu cầu, gửi thêm tới người gửi (preview)
        if (Boolean.TRUE.equals(request.getIncludeSender())) {
            User sender = userRepository.findByEmail(senderEmail).orElse(null);
            if (sender != null) {
                try {
                    Notification notif = new Notification();
                    notif.setUser(sender);
                    notif.setContent(body);
                    notif.setCreatedAt(LocalDateTime.now());
                    notif.setIsRead(false);
                    notif.setType(NotificationType.EVENT_UPDATE);
                    notif.setRelatedId(event.getId());
                    notif.setRelatedType(RelatedType.EVENT);
                    notificationRepository.save(notif);
                } catch (Exception e) { /* ignore */ }
                try {
                    webPushNotificationService.sendNotificationToUser(sender.getId(), title, body, url);
                } catch (Exception ex) {
                    System.err.println("[WebPush] sendCustomNotification -> send failed for sender userId=" + (sender==null?null:sender.getId()) + " : " + ex.getMessage());
                }
            }
        }
    }

    // Notify registration status change to the specific user
    public void notifyRegistrationStatusChange(Long userId, Long eventId, RegistrationStatus status) {
        User u = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Event e = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        String verb;
        switch (status) {
            case APPROVED: verb = "đã được duyệt"; break;
            case REJECTED: verb = "bị từ chối"; break;
            case COMPLETED: verb = "đã hoàn thành"; break;
            case CANCELED: verb = "đã bị huỷ"; break;
            default: verb = status.name();
        }
        String content = String.format("Đăng ký của bạn cho sự kiện \"%s\" %s.", e.getTitle(), verb);
        Notification notif = new Notification();
        notif.setUser(u);
        notif.setType(NotificationType.EVENT_REGISTRATION);
        notif.setContent(content);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setRelatedId(e.getId());
        notif.setRelatedType(RelatedType.EVENT);
        notificationRepository.save(notif);

        try {
            webPushNotificationService.sendNotificationToUser(u.getId(), "Trạng thái đăng ký", content, "/events/" + e.getId());
        } catch (Exception ex) {
            System.err.println("[Notification] webpush error: " + ex.getMessage());
        }
    }

    // Notify when new event is approved -> send to ALL users (webpush + optional entity per user)
    public void notifyNewEvent(Long eventId) {
        Event e = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        String title = "Sự kiện mới: " + e.getTitle();
        String body = "Sự kiện đã được duyệt. Xem chi tiết và tham gia ngay!";
        // attempt webpush to all subscriptions
        try {
            webPushNotificationService.sendNotificationToAll(title, body, "/events/" + e.getId());
        } catch (Exception ex) {
            System.err.println("[Notification] broadcast webpush failed: " + ex.getMessage());
        }

        // Persist per-user Notification records (optional): create for active users only to avoid huge insert
        List<User> users = userRepository.findAll();
        for (User u : users) {
            Notification notif = new Notification();
            notif.setUser(u);
            notif.setType(NotificationType.EVENT_UPDATE);
            notif.setContent(body);
            notif.setCreatedAt(LocalDateTime.now());
            notif.setRelatedId(e.getId());
            notif.setRelatedType(RelatedType.EVENT);
            notificationRepository.save(notif);
        }
    }

    // Notify recipient that someone reacted to their post/comment.
    public void notifyReaction(Long recipientUserId, Long relatedId, RelatedType relatedType, ReactionType reactionType) {
        notifyReaction(recipientUserId, relatedId, relatedType, reactionType, null);
    }

    // Overload: include actorUserId
    public void notifyReaction(Long recipientUserId, Long relatedId, RelatedType relatedType, ReactionType reactionType, Long actorUserId) {
        User recipient = userRepository.findById(recipientUserId).orElseThrow(() -> new RuntimeException("User not found"));
        String actorName = null;
        if (actorUserId != null) {
            actorName = userRepository.findById(actorUserId).map(User::getFullName).orElse(null);
        }
        String target = relatedType == RelatedType.POST ? "bài viết của bạn" : "bình luận của bạn";
        String content = (actorName != null ? actorName : "Ai đó") + " đã phản ứng (" + reactionType + ") với " + target + ".";
        Notification notif = new Notification();
        notif.setUser(recipient);
        notif.setType(NotificationType.POST_REACTION);
        notif.setContent(content);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setRelatedId(relatedId);
        notif.setRelatedType(relatedType);
        notif.setActorId(actorUserId);
        notif.setActorName(actorName);
        notificationRepository.save(notif);

        try {
            webPushNotificationService.sendNotificationToUser(recipient.getId(), "Phản ứng mới", content, "/");
        } catch (Exception ex) {
            System.err.println("[Notification] webpush error: " + ex.getMessage());
        }
    }

    // Notify comment: someone commented on your post/comment
    public void notifyComment(Long recipientUserId, Long relatedId, RelatedType relatedType, Long actorUserId) {
        User recipient = userRepository.findById(recipientUserId).orElseThrow(() -> new RuntimeException("User not found"));
        String actorName = null;
        if (actorUserId != null) {
            actorName = userRepository.findById(actorUserId).map(User::getFullName).orElse(null);
        }
        String target = relatedType == RelatedType.POST ? "bài viết của bạn" : "bình luận của bạn";
        String content = (actorName != null ? actorName : "Ai đó") + " đã bình luận vào " + target + ".";
        Notification notif = new Notification();
        notif.setUser(recipient);
        notif.setType(NotificationType.COMMENT);
        notif.setContent(content);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setRelatedId(relatedId);
        notif.setRelatedType(relatedType);
        notif.setActorId(actorUserId);
        notif.setActorName(actorName);
        notificationRepository.save(notif);
        try {
            webPushNotificationService.sendNotificationToUser(recipient.getId(), "Bình luận mới", content, "/");
        } catch (Exception ex) {
            System.err.println("[Notification] webpush error: " + ex.getMessage());
        }
    }

    // Read single notification
    public NotificationDTO getNotificationById(Long id, String email) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getEmail().equals(email)) throw new RuntimeException("Unauthorized");
        return modelMapper.map(n, NotificationDTO.class);
    }

    // List notifications for a user (newest first)
    public List<NotificationDTO> getNotifications(Long userId) {
        List<Notification> list = notificationRepository.findByUserId(userId);
        return list.stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(n -> modelMapper.map(n, NotificationDTO.class))
                .collect(Collectors.toList());
    }

    // Return notifications for a user filtered by event
    public List<NotificationDTO> getNotificationsForEvent(Long eventId, String email) {
        User u = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserId(u.getId()).stream()
                .filter(n -> n.getRelatedType() == RelatedType.EVENT && n.getRelatedId() != null && n.getRelatedId().equals(eventId))
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(n -> modelMapper.map(n, NotificationDTO.class))
                .collect(Collectors.toList());
    }

    // Mark a single notification as read (only owner)
    public NotificationDTO markAsRead(Long id, String email) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getEmail().equals(email)) throw new RuntimeException("Unauthorized");
        n.setIsRead(true);
        notificationRepository.save(n);
        return modelMapper.map(n, NotificationDTO.class);
    }

    // Mark all notifications for user as read
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserId(userId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }

    // Delete notification (owner only)
    public void deleteNotification(Long id, String email) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getEmail().equals(email)) throw new RuntimeException("Unauthorized");
        notificationRepository.delete(n);
    }
}