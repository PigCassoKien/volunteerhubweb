package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class CustomNotificationRequestDTO {
    private Long eventId;
    private String content;
    // nếu true -> gửi thêm cho người gửi (dùng để preview / test)
    private Boolean includeSender = false;
}
