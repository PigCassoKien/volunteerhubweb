package com.example.volunteerhub.dto;

import com.example.volunteerhub.entity.enums.UserRole;
import lombok.Data;

@Data
public class AssignRoleRequestDTO {
    private Long userId;
    private UserRole role;
}