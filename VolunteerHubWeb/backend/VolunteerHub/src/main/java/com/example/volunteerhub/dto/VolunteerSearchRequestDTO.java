package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.RegistrationStatus;
import lombok.Data;

@Data
public class VolunteerSearchRequestDTO {
    private String keyword;
    private RegistrationStatus status;
    private Long eventId;
}