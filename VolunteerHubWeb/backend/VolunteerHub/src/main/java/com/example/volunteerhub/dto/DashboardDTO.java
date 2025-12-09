package com.example.volunteerhub.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardDTO {
    private List<EventDTO> newEvents; // Sự kiện mới công bố
    private List<EventDTO> trendingEvents; // Sự kiện thu hút
    private List<PostDTO> newPosts; // Bài đăng mới trong kênh trao đổi

    // Metrics
    private Integer totalEvents;
    private Integer totalUsers;
    private Integer totalVolunteers;
    private Integer totalManagers;
    private Integer totalRegistrations;
    private Integer totalApprovedRegistrations;
    private Integer activeUsersLast7Days;
    private Long siteVisits; // placeholder if you collect analytics
}