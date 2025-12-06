package com.example.volunteerhub.entity;

import com.example.volunteerhub.entity.enums.RegistrationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    private LocalDateTime registeredAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String occupation;
    @Column(length = 2000)
    private String about;
    private String phone;
    private String contactEmail;
    private String school;
    @Column(length = 2000)
    private String experience;
    @Column(length = 2000)
    private String skills;
    private Boolean confirmation;

}
