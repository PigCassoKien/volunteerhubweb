package com.example.volunteerhub.entity;

import com.example.volunteerhub.entity.enums.PostStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String content;

    @ElementCollection
    private List<String> mediaFiles; // List of image file paths or URLs

    @Enumerated(EnumType.STRING)
    private PostStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
