package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.entity.enums.UserStatus;
import com.example.volunteerhub.entity.enums.VerificationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String avatarFile;
    private UserRole role;
    private String publicProfile;
    private VerificationStatus verificationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}