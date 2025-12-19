package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.Notification;
import com.example.volunteerhub.entity.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);
    List<Notification> findByUserId(Long userId);
    Optional<Notification> findFirstByUserIdAndRelatedIdAndType(Long userId, Long relatedId, NotificationType type);
}