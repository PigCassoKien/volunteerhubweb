package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class EventReportDTO {
    private Long eventId;
    private String eventTitle;
    private int totalParticipants;
    private int approvedParticipants;
    private int totalPosts;
}