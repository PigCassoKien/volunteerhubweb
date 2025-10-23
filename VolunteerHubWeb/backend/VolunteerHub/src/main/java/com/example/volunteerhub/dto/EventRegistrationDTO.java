package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.RegistrationStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EventRegistrationDTO {
    private Long id;
    private Long userId;
    private Long eventId;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime completedAt;
    private String certificateUrl;

    // volunteer form fields exposed to manager / owner
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String occupation;
    private String about;
    private String phone;
    private String contactEmail;
    private String school;
    private String experience;
    private String skills;
    private Boolean confirmation;
}
