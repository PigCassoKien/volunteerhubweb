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
    private String userFullName;
    private String content;
    private List<String> mediaFiles;
    private PostStatus status;
    private LocalDateTime createdAt;

    private String eventTitle;

    // Filename of user's avatar (stored on server). Frontend expects `userAvatar` or `userAvatarFile`.
    private String userAvatarFile;

    // Bài viết có phải thông báo (announcement) không
    private Boolean announcement;

    // client helper: whether current requester can delete this post
    private Boolean canDelete;
}