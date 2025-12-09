package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.DashboardDTO;
import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.dto.PostDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.EventStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.UserRepository;
import com.example.volunteerhub.repository.EventRegistrationRepository;
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
    private UserRepository userRepository;

    @Autowired
    private EventRegistrationRepository registrationRepository;

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

        // Metrics
        long totalEvents = eventRepository.count();
        long totalUsers = userRepository.count();
        long totalVolunteers = userRepository.findByRole(UserRole.VOLUNTEER).size();
        long totalManagers = userRepository.findByRole(UserRole.EVENT_MANAGER).size();
        long totalRegistrations = registrationRepository.count();
        long totalApprovedRegistrations = registrationRepository.findByStatus(com.example.volunteerhub.entity.enums.RegistrationStatus.APPROVED).size();

        LocalDateTime now = LocalDateTime.now();
        int activeLast7 = (int) userRepository.findAll().stream()
                .filter(u -> u.getLastLoginAt() != null && u.getLastLoginAt().isAfter(now.minusDays(7)))
                .count();

        dashboard.setTotalEvents((int) totalEvents);
        dashboard.setTotalUsers((int) totalUsers);
        dashboard.setTotalVolunteers((int) totalVolunteers);
        dashboard.setTotalManagers((int) totalManagers);
        dashboard.setTotalRegistrations((int) totalRegistrations);
        dashboard.setTotalApprovedRegistrations((int) totalApprovedRegistrations);
        dashboard.setActiveUsersLast7Days(activeLast7);
        dashboard.setSiteVisits(0L); // placeholder: integrate analytics later

        return dashboard;
    }
}
