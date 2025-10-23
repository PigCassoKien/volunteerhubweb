package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.ReactionType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReactionDTO {
    private Long id;
    private Long userId;
    private Long postId;
    private Long commentId;
    private ReactionType reactionType;
    private LocalDateTime createdAt;
}