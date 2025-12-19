package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class VolunteerRankDTO {
    private Long userId;
    private String fullName;
    private String avatarFile;
    private int registrations;
}
