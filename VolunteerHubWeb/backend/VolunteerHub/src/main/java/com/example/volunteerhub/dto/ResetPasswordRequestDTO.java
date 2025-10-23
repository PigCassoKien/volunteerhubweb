package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    private String email;
    private String code;
    private String newPassword;
}