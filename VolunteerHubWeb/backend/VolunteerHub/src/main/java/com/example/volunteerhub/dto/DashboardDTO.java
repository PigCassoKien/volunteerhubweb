package com.example.volunteerhub.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardDTO {
    private List<EventDTO> newEvents; // Sự kiện mới công bố
    private List<EventDTO> trendingEvents; // Sự kiện thu hút
    private List<PostDTO> newPosts; // Bài đăng mới trong kênh trao đổi
}