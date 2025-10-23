package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.OtpType;
import lombok.Data;

@Data
public class OTPRequestDTO {
    private String email;
    private String code;
    private OtpType type;
}