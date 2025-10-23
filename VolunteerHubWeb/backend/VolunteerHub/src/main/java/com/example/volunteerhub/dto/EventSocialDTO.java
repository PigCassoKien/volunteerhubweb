package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class EventSocialDTO {
    private Long eventId;
    private String socialChannelUrl;
    private String otherInfo;
}
