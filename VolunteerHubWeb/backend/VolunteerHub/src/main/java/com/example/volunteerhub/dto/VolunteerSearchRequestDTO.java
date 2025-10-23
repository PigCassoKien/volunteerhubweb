package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.RegistrationStatus;
import lombok.Data;

@Data
public class VolunteerSearchRequestDTO {
    private String keyword; // Từ khóa tìm kiếm (email, fullName)
    private RegistrationStatus status; // Lọc theo trạng thái đăng ký sự kiện
    private Long eventId; // Lọc theo sự kiện
}