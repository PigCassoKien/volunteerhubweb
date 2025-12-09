package com.example.volunteerhub.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long id;
    private Long postId;
    private Long userId;
    private String userFullName; // <- added
    private Long parentCommentId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // client helper: whether current requester can delete this comment
    private Boolean canDelete;
}
