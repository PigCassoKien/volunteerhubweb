package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.RegistrationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventHistoryRequestDTO {
    private RegistrationStatus status; // Lọc theo trạng thái
    private LocalDateTime startDate; // Lọc theo thời gian bắt đầu
    private LocalDateTime endDate; // Lọc theo thời gian kết thúc
    private Long categoryId; // Lọc theo danh mục
    private String sortBy; // Sắp xếp (dateAsc, dateDesc)
}