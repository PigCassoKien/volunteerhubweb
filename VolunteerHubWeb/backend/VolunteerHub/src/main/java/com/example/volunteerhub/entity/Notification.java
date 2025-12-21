package com.example.volunteerhub.entity;

import com.example.volunteerhub.entity.enums.NotificationType;
import com.example.volunteerhub.entity.enums.RelatedType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String content;
    private Boolean isRead = false;
    private LocalDateTime createdAt;
    private Long relatedId;

    @Enumerated(EnumType.STRING)
    private RelatedType relatedType;

    private Long actorId;
    private String actorName;
}
