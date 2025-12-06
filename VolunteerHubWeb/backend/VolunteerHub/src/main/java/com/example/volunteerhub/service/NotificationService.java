package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.CustomNotificationRequestDTO;
import com.example.volunteerhub.dto.NotificationDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.Notification;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.*;
import com.example.volunteerhub.repository.EventRegistrationRepository;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.NotificationRepository;
import com.example.volunteerhub.repository.UserRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
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
    private ModelMapper modelMapper;

    @Autowired
    private WebPushNotificationService webPushNotificationService; // <- ensure available

    // Create
    public void notifyPostStatusChange(Long userId, Long postId, PostStatus status) {
        Notification notification = new Notification();
        notification.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
        notification.setType(NotificationType.POST_REACTION);
        notification.setContent("Your post has been " + status.name().toLowerCase());
        notification.setRelatedId(postId);
        notification.setRelatedType(RelatedType.POST);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
        sendWebPushNotification(notification);
    }

    public void notifyNewEvent(Long eventId) {
        List<User> volunteers = userRepository.findByRole(UserRole.VOLUNTEER);
        for (User user : volunteers) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(NotificationType.EVENT_UPDATE);
            notification.setContent("A new event has been added!");
            notification.setRelatedId(eventId);
            notification.setRelatedType(RelatedType.EVENT);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
            sendWebPushNotification(notification);
        }
    }

    // Send custom notification to all APPROVED participants of an event
    public void sendCustomNotification(CustomNotificationRequestDTO request, String email) {
        if (request == null || request.getEventId() == null) {
            throw new RuntimeException("Invalid request");
        }

        User sender = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(request.getEventId()).orElseThrow(() -> new RuntimeException("Event not found"));

        // only event owner (manager) or admin can send
        boolean isManagerOfEvent = sender.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && sender.getId().equals(event.getCreatedBy().getId());
        boolean isAdmin = sender.getRole() == UserRole.ADMIN;

        if (!isManagerOfEvent && !isAdmin) {
            throw new RuntimeException("Unauthorized");
        }

        // get approved registrations
        List<EventRegistration> approved = registrationRepository.findByEventIdAndStatus(event.getId(), RegistrationStatus.APPROVED);
        if (approved == null || approved.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();

        // create notifications for each user and send web-push
        for (EventRegistration reg : approved) {
            User u = reg.getUser();
            if (u == null) continue;

            Notification n = new Notification();
            n.setUser(u);
            n.setType(NotificationType.EVENT_UPDATE);
            n.setContent(request.getContent() != null ? request.getContent() : ("Thông báo sự kiện: " + event.getTitle()));
            n.setRelatedId(event.getId());
            n.setRelatedType(RelatedType.EVENT);
            n.setIsRead(false);
            n.setCreatedAt(now);
            notificationRepository.save(n);

            // send web push with link to event detail
            String url = "/events/" + event.getId();
            try {
                webPushNotificationService.sendNotificationToUser(u.getId(),
                        "Thông báo sự kiện: " + event.getTitle(),
                        n.getContent(),
                        url);
            } catch (Exception ex) {
                // log & continue
                ex.printStackTrace();
            }
        }
    }

    // Read single notification
    public NotificationDTO getNotificationById(Long id, String email) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (n.getUser() == null) throw new RuntimeException("Invalid notification");
        User req = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!n.getUser().getId().equals(req.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        NotificationDTO dto = modelMapper.map(n, NotificationDTO.class);
        dto.setUserId(n.getUser().getId());
        return dto;
    }

    // List notifications for a user (newest first)
    public List<NotificationDTO> getNotifications(Long userId) {
        List<Notification> list = notificationRepository.findAll().stream()
                .filter(n -> n.getUser() != null && n.getUser().getId().equals(userId))
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        return list.stream().map(n -> {
            NotificationDTO dto = modelMapper.map(n, NotificationDTO.class);
            dto.setUserId(n.getUser().getId());
            return dto;
        }).collect(Collectors.toList());
    }

    // Mark a single notification as read (only owner)
    public NotificationDTO markAsRead(Long id, String email) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        User req = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!n.getUser().getId().equals(req.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        if (Boolean.FALSE.equals(n.getIsRead())) {
            n.setIsRead(true);
            notificationRepository.save(n);
        }
        NotificationDTO dto = modelMapper.map(n, NotificationDTO.class);
        dto.setUserId(n.getUser().getId());
        return dto;
    }

    // Mark all notifications for user as read
    public void markAllAsRead(Long userId) {
        // try to use repo helper if available
        List<Notification> unread = notificationRepository.findByUserIdAndIsRead(userId, false);
        if (unread == null || unread.isEmpty()) return;
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    // Delete notification (owner only)
    public void deleteNotification(Long id, String email) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        User req = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!n.getUser().getId().equals(req.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        notificationRepository.deleteById(id);
    }

    private void sendWebPushNotification(Notification notification) {
        String subscriptionId = notification.getUser().getSubscriptionId();
        if (subscriptionId != null) {
            Message message = Message.builder()
                    .putData("title", "New Notification")
                    .putData("body", notification.getContent())
                    .setToken(subscriptionId)
                    .build();
            try {
                FirebaseMessaging.getInstance().send(message);
            } catch (Exception e) {
                // Log error
            }
        }
    }
    // Java
    public void notifyReaction(Long userId, Long relatedId, RelatedType relatedType, com.example.volunteerhub.entity.enums.ReactionType reactionType) {
        Notification notification = new Notification();
        notification.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
        notification.setType(NotificationType.POST_REACTION);
        notification.setContent("Your " + relatedType.name().toLowerCase() + " received a " + reactionType.name().toLowerCase() + " reaction.");
        notification.setRelatedId(relatedId);
        notification.setRelatedType(relatedType);
        notification.setIsRead(false);
        notification.setCreatedAt(java.time.LocalDateTime.now());
        notificationRepository.save(notification);
        sendWebPushNotification(notification);
    }

    // Notify single user about registration status change and send webpush
    public void notifyRegistrationStatusChange(Long userId, Long eventId, RegistrationStatus status) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId).orElse(null);

        String title = "Cập nhật đăng ký";
        String body;
        switch (status) {
            case APPROVED:
                body = "Bạn đã được xác nhận tham gia sự kiện" + (event != null ? " \"" + event.getTitle() + "\"" : "");
                break;
            case REJECTED:
                body = "Đăng ký của bạn cho sự kiện" + (event != null ? " \"" + event.getTitle() + "\"" : "") + " đã bị từ chối.";
                break;
            case CANCELED:
                body = "Đăng ký cho sự kiện" + (event != null ? " \"" + event.getTitle() + "\"" : "") + " đã bị hủy.";
                break;
            case COMPLETED:
                body = "Chúc mừng! Bạn đã hoàn thành sự kiện" + (event != null ? " \"" + event.getTitle() + "\"" : "") + ".";
                break;
            case PENDING:
            default:
                body = "Trạng thái đăng ký của bạn cho sự kiện" + (event != null ? " \"" + event.getTitle() + "\"" : "") + " là: " + status.name();
        }

        Notification n = new Notification();
        n.setUser(user);
        n.setType(NotificationType.EVENT_REGISTRATION);
        n.setContent(body);
        n.setIsRead(false);
        n.setCreatedAt(LocalDateTime.now());
        n.setRelatedId(eventId);
        n.setRelatedType(RelatedType.EVENT);
        notificationRepository.save(n);

        // try to send webpush (sw.js will open URL when clicking)
        try {
            String url = event != null ? ("/events/" + event.getId()) : "/";
            webPushNotificationService.sendNotificationToUser(userId, title, body, url);
        } catch (Exception ex) {
            // log but don't fail workflow
            ex.printStackTrace();
        }
    }

}