package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.RegistrationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventHistoryRequestDTO {
    private RegistrationStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long categoryId;
    private String sortBy;
}