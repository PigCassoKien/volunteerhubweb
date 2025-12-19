package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.DashboardDTO;
import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.dto.PostDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.enums.PostStatus;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.EventStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.UserRepository;
import com.example.volunteerhub.repository.ReactionRepository;
import com.example.volunteerhub.repository.CommentRepository;
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
    private ReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Public dashboard (anyone can view)
    public DashboardDTO getDashboardStats() {
        return buildDashboard(LocalDateTime.now().minusDays(7), null, null, null);
    }

    // Public dashboard by date range
    public DashboardDTO getDashboardStatsByDateRange(LocalDateTime start, LocalDateTime end) {
        return buildDashboard(null, start, end, null);
    }

    // Authenticated-aware dashboard: pass requester's email (may be null)
    public DashboardDTO getDashboardStats(String requesterEmail) {
        return buildDashboard(LocalDateTime.now().minusDays(7), null, null, requesterEmail);
    }

    public DashboardDTO getDashboardStatsByDateRange(LocalDateTime start, LocalDateTime end, String requesterEmail) {
        return buildDashboard(null, start, end, requesterEmail);
    }

    // Internal builder: if last7Days != null use it for "new" filter, otherwise use start/end when provided
    private DashboardDTO buildDashboard(LocalDateTime last7Days, LocalDateTime start, LocalDateTime end, String requesterEmail) {
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

        // Trending events: compute simple popularity score based on recent registrations and post interactions
        List<Event> approved = eventRepository.findByStatus(EventStatus.APPROVED);
        LocalDateTime recentCut = last7Days != null ? last7Days : (start != null ? start : LocalDateTime.now().minusDays(7));

        List<EventDTO> trending = approved.stream().map(ev -> {
            // registrations in recent window with APPROVED status
            int recentRegs = 0;
            try {
                recentRegs = (int) registrationRepository.findByEventIdAndStatus(ev.getId(), com.example.volunteerhub.entity.enums.RegistrationStatus.APPROVED)
                        .stream()
                        .filter(r -> r.getRegisteredAt() != null && r.getRegisteredAt().isAfter(recentCut))
                        .count();
            } catch (Exception ignored) { }

            // recent posts interactions (reactions + comments)
            int recentInteractions = 0;
            try {
                // Only consider APPROVED posts for trending interactions
                List<Post> posts = postRepository.findByEventIdAndStatus(ev.getId(), PostStatus.APPROVED);
                for (Post p : posts) {
                    if (p.getCreatedAt() != null && p.getCreatedAt().isAfter(recentCut)) {
                        int reactions = reactionRepository.countByPostId(p.getId());
                        int comments = commentRepository.findByPostId(p.getId()).size();
                        recentInteractions += reactions + comments;
                    }
                }
            } catch (Exception ignored) { }

            // weighted score: registrations heavier than interactions
            int score = recentRegs * 3 + recentInteractions;
            EventDTO dto = modelMapper.map(ev, EventDTO.class);
            try {
                dto.setRegisteredCount(registrationRepository.countByEventId(ev.getId()));
            } catch (Exception ignored) { }
            // temporarily store score in description field if needed by client (or add new DTO field later)
            // but better to reuse DTO.title/description not ideal — keep score outside; for now set description to include score
            dto.setDescription((dto.getDescription() == null ? "" : dto.getDescription()) + "\n__score:" + score);
            return new java.util.AbstractMap.SimpleEntry<>(ev, new java.util.AbstractMap.SimpleEntry<>(score, dto));
        }).sorted((a, b) -> Integer.compare(b.getValue().getKey(), a.getValue().getKey()))
                .limit(10)
                .map(e -> e.getValue().getValue())
                .collect(Collectors.toList());

        dashboard.setTrendingEvents(trending);

        // New posts: either last7Days or between start/end
        List<Post> newPosts;
        if (last7Days != null) {
            newPosts = postRepository.findByCreatedAtAfter(last7Days);
        } else {
            newPosts = postRepository.findByCreatedAtBetween(start, end);
        }
        // only expose APPROVED posts in public dashboard
        // Determine if requester is a volunteer and which event ids they are approved for
        final java.util.Set<Long> allowedEventIds;
        if (requesterEmail != null) {
            java.util.Set<Long> ids = null;
            try {
                User requester = userRepository.findByEmail(requesterEmail).orElse(null);
                if (requester != null && requester.getRole() == UserRole.VOLUNTEER) {
                    ids = registrationRepository.findByUserId(requester.getId()).stream()
                            .filter(r -> r.getStatus() == com.example.volunteerhub.entity.enums.RegistrationStatus.APPROVED)
                            .map(r -> r.getEvent().getId())
                            .collect(Collectors.toSet());
                }
            } catch (Exception ignored) { }
            allowedEventIds = ids;
        } else {
            allowedEventIds = null;
        }

        dashboard.setNewPosts(newPosts.stream()
                .filter(p -> p.getStatus() == PostStatus.APPROVED)
                .filter(p -> {
                    if (allowedEventIds == null) return true; // not a volunteer or not authenticated -> show all approved
                    return allowedEventIds.contains(p.getEvent().getId());
                })
                .sorted(Comparator.comparing(p -> p.getCreatedAt() == null ? LocalDateTime.MIN : p.getCreatedAt(), Comparator.reverseOrder()))
                .limit(10)
                .map(post -> {
                    PostDTO dto = modelMapper.map(post, PostDTO.class);
                    dto.setEventTitle(post.getEvent() != null ? post.getEvent().getTitle() : null);
                    return dto;
                })
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
