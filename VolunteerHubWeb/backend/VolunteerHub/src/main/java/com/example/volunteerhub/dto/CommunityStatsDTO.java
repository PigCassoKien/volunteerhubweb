package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class CommunityStatsDTO {
    private long totalVolunteers;
    private long provincesCount;
    private long totalEvents;
    private long totalRegistrations;
}
