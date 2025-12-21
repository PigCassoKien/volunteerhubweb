package com.example.volunteerhub.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardDTO {
    private List<EventDTO> newEvents;
    private List<EventDTO> trendingEvents;
    private List<PostDTO> newPosts;

    private Integer totalEvents;
    private Integer totalUsers;
    private Integer totalVolunteers;
    private Integer totalManagers;
    private Integer totalRegistrations;
    private Integer totalApprovedRegistrations;
    private Integer activeUsersLast7Days;
    private Long siteVisits;
}