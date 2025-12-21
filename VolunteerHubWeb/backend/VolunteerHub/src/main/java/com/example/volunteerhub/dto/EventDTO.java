package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.Category;
import com.example.volunteerhub.entity.enums.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private Category category;
    private EventStatus status;
    private Long createdById;
    private String createdByFullName;
    private Integer registeredCount;
    private String imageFile;
    private LocalDateTime createdAt;
    private Integer maxParticipants;
}