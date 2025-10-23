package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.UserRole;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String publicProfile;

    private UserRole role;
}