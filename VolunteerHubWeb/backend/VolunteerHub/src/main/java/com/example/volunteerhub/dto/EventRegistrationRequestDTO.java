package com.example.volunteerhub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EventRegistrationRequestDTO {
    @NotBlank
    private String fullName;
    @NotBlank
    private String gender; // "Male", "Female", "Other", etc.

    // Accept as String from frontend (yyyy-MM-dd) and parse server-side for robust error handling
    @NotBlank
    private String dateOfBirth;

    @NotBlank
    private String address;
    @NotBlank
    private String occupation;
    @NotBlank
    private String about; // description / self-intro

    @NotBlank
    private String phone;

    @NotBlank
    @Email
    private String email;

    // optional for students
    private String school;

    private String experience; // free text
    private String skills; // comma separated or free text

    @NotNull
    private Boolean confirmation; // Xác nhận và cam kết
}
