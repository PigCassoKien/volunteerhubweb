package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class UpdateUserRequestDTO {
    private String fullName;
    private String phoneNumber;
    private String address;
    private String avatarFile;
}
