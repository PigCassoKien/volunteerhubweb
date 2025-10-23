package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.CustomNotificationRequestDTO;
import com.example.volunteerhub.dto.NotificationDTO;
import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.Notification;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.*;
import com.example.volunteerhub.repository.EventRegistrationRepository;
import com.example.volunteerhub.repository.NotificationRepository;
import com.example.volunteerhub.repository.UserRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    private ModelMapper modelMapper;

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

    public void sendCustomNotification(CustomNotificationRequestDTO request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != UserRole.EVENT_MANAGER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        List<EventRegistration> registrations = registrationRepository.findByEventIdAndStatus(
                request.getEventId(), RegistrationStatus.APPROVED);
        for (EventRegistration reg : registrations) {
            Notification notification = new Notification();
            notification.setUser(reg.getUser());
            notification.setType(NotificationType.EVENT_UPDATE);
            notification.setContent(request.getContent());
            notification.setRelatedId(request.getEventId());
            notification.setRelatedType(RelatedType.EVENT);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
            sendWebPushNotification(notification);
        }
    }

    // Read
    public NotificationDTO getNotificationById(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        return modelMapper.map(notification, NotificationDTO.class);
    }

    public List<NotificationDTO> getNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsRead(userId, false).stream()
                .map(notification -> modelMapper.map(notification, NotificationDTO.class))
                .collect(Collectors.toList());
    }

    // Update
    public NotificationDTO markAsRead(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return modelMapper.map(notification, NotificationDTO.class);
    }

    // Delete
    public void deleteNotification(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getEmail().equals(email)) {
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

}