package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.PostStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostDTO {
    private Long id;
    private Long eventId;
    private Long userId;
    private String userFullName; // <- added
    private String content;
    private List<String> mediaFiles;
    private PostStatus status;
    private LocalDateTime createdAt;
}