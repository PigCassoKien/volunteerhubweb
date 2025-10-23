package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.DashboardDTO;
import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.dto.PostDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.enums.EventStatus;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.PostRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Public dashboard (anyone can view)
    public DashboardDTO getDashboardStats() {
        return buildDashboard(LocalDateTime.now().minusDays(7), null, null);
    }

    // Public dashboard by date range
    public DashboardDTO getDashboardStatsByDateRange(LocalDateTime start, LocalDateTime end) {
        return buildDashboard(null, start, end);
    }

    // Internal builder: if last7Days != null use it for "new" filter, otherwise use start/end when provided
    private DashboardDTO buildDashboard(LocalDateTime last7Days, LocalDateTime start, LocalDateTime end) {
        DashboardDTO dashboard = new DashboardDTO();

        // New events: either last7Days or between start/end
        List<Event> newEvents;
        if (last7Days != null) {
            newEvents = eventRepository.findByCreatedAtAfter(last7Days);
        } else {
            newEvents = eventRepository.findByCreatedAtBetween(start, end);
        }
        // Sort newest first and map
        dashboard.setNewEvents(newEvents.stream()
                .sorted(Comparator.comparing(e -> e.getCreatedAt() == null ? LocalDateTime.MIN : e.getCreatedAt(), Comparator.reverseOrder()))
                .limit(10)
                .map(event -> modelMapper.map(event, EventDTO.class))
                .collect(Collectors.toList()));

        // Trending events: APPROVED, sort by createdAt desc and limit (placeholder for actual popularity metric)
        List<Event> trendingEvents = eventRepository.findByStatus(EventStatus.APPROVED);
        dashboard.setTrendingEvents(trendingEvents.stream()
                .sorted(Comparator.comparing(e -> e.getCreatedAt() == null ? LocalDateTime.MIN : e.getCreatedAt(), Comparator.reverseOrder()))
                .limit(10)
                .map(event -> modelMapper.map(event, EventDTO.class))
                .collect(Collectors.toList()));

        // New posts: either last7Days or between start/end
        List<Post> newPosts;
        if (last7Days != null) {
            newPosts = postRepository.findByCreatedAtAfter(last7Days);
        } else {
            newPosts = postRepository.findByCreatedAtBetween(start, end);
        }
        dashboard.setNewPosts(newPosts.stream()
                .sorted(Comparator.comparing(p -> p.getCreatedAt() == null ? LocalDateTime.MIN : p.getCreatedAt(), Comparator.reverseOrder()))
                .limit(10)
                .map(post -> modelMapper.map(post, PostDTO.class))
                .collect(Collectors.toList()));

        return dashboard;
    }
}
