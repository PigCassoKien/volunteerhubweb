package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class CustomNotificationRequestDTO {
    private Long eventId;
    private String content;
    private Boolean includeSender = false;
}
