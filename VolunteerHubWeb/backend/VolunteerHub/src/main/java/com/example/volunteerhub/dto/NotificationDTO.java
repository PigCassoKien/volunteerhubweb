package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.NotificationType;
import com.example.volunteerhub.entity.enums.RelatedType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedId;
    private RelatedType relatedType;
}