package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.dto.EventSocialDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.EventStatus;
import com.example.volunteerhub.entity.enums.PostStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.UserRepository;
import com.example.volunteerhub.repository.EventRegistrationRepository;
import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.enums.RegistrationStatus;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EventRegistrationRepository registrationRepository;

    private EventRegistrationService registrationService;

    // Create
    public EventDTO createEvent(EventDTO eventDTO, String createdByEmail) {
        User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = modelMapper.map(eventDTO, Event.class);
        event.setCreatedBy(createdBy);
        event.setStatus(EventStatus.PENDING);
        event.setCreatedAt(LocalDateTime.now());
        if (eventDTO.getMaxParticipants() != null) {
            event.setMaxParticipants(eventDTO.getMaxParticipants());
        }
        event = eventRepository.save(event);
        return modelMapper.map(event, EventDTO.class);
    }

    // Read
    private EventDTO mapEventToDTOWithExtras(Event event) {
        EventDTO dto = modelMapper.map(event, EventDTO.class);
        if (event.getCreatedBy() != null) {
            dto.setCreatedByFullName(event.getCreatedBy().getFullName());
            dto.setCreatedById(event.getCreatedBy().getId());
        }
        List<EventRegistration> regs = registrationRepository.findByEventId(event.getId());
        long count = regs.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.APPROVED || r.getStatus() == RegistrationStatus.PENDING)
                .count();
        dto.setRegisteredCount((int) count);
        return dto;
    }

    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapEventToDTOWithExtras(event);
    }

    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapEventToDTOWithExtras)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByCategory(Long categoryId) {
        return eventRepository.findByCategoryId(categoryId).stream()
                .map(this::mapEventToDTOWithExtras)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByStartDateBetween(start, end).stream()
                .map(event -> modelMapper.map(event, EventDTO.class))
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByManager(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<Event> events = eventRepository.findByCreatedBy(user.getId());
        return events.stream().map(this::mapEventToDTOWithExtras).collect(Collectors.toList());
    }

    // Update
    public EventDTO updateEvent(Long id, EventDTO eventDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != UserRole.EVENT_MANAGER) {
            throw new RuntimeException("Unauthorized");
        }

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (eventDTO.getTitle() != null) event.setTitle(eventDTO.getTitle());
        if (eventDTO.getDescription() != null) event.setDescription(eventDTO.getDescription());
        if (eventDTO.getStartDate() != null) event.setStartDate(eventDTO.getStartDate());
        if (eventDTO.getEndDate() != null) event.setEndDate(eventDTO.getEndDate());
        if (eventDTO.getLocation() != null) event.setLocation(eventDTO.getLocation());
        if (eventDTO.getCategory() != null) event.setCategory(eventDTO.getCategory());
        if (eventDTO.getMaxParticipants() != null) event.setMaxParticipants(eventDTO.getMaxParticipants());
        if (eventDTO.getImageFile() != null) event.setImageFile(eventDTO.getImageFile());

        event.setUpdatedAt(LocalDateTime.now());
        event = eventRepository.save(event);
        return modelMapper.map(event, EventDTO.class);
    }

    // Delete
    public void deleteEvent(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != UserRole.EVENT_MANAGER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        eventRepository.deleteById(id);
    }

    public EventDTO approveEvent(Long eventId, String adminEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getStatus() == EventStatus.APPROVED) {
            return mapEventToDTOWithExtras(event);
        }

        event.setStatus(EventStatus.APPROVED);
        event.setUpdatedAt(LocalDateTime.now());
        event = eventRepository.save(event);

        try {
            notificationService.notifyNewEvent(event.getId());
        } catch (Exception ex) {
            System.err.println("[EventService] notifyNewEvent failed for eventId=" + event.getId() + " : " + ex.getMessage());
        }

        return mapEventToDTOWithExtras(event);
    }

    public boolean canAccessEventSocial(Long eventId,String email) {
        if (email == null) return false;
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.EVENT_MANAGER ) {
            return true;
        }
        return registrationService.hasApproveRegistration(eventId, user.getId());
    }

    public EventSocialDTO getEventSocial(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        EventSocialDTO dto = new EventSocialDTO();
        dto.setEventId(event.getId());
        dto.setSocialChannelUrl("/events/" + event.getId() + "/social-channel");
        dto.setOtherInfo("Only accessible to admin, event manager, or approved volunteers");
        return dto;
    }
}