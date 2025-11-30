package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.dto.EventSocialDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.EventStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.UserRepository;
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
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ModelMapper modelMapper;

    private EventRegistrationService registrationService;

    // Create
    public EventDTO createEvent(EventDTO eventDTO, String createdByEmail) {
        User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = modelMapper.map(eventDTO, Event.class);
        event.setCreatedBy(createdBy);
        event.setStatus(EventStatus.PENDING);
        event.setCreatedAt(LocalDateTime.now());
        event = eventRepository.save(event);
        notificationService.notifyNewEvent(event.getId());
        return modelMapper.map(event, EventDTO.class);
    }

    // Read
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return modelMapper.map(event, EventDTO.class);
    }

    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(event -> modelMapper.map(event, EventDTO.class))
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByCategory(Long categoryId) {
        return eventRepository.findByCategoryId(categoryId).stream()
                .map(event -> modelMapper.map(event, EventDTO.class))
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByStartDateBetween(start, end).stream()
                .map(event -> modelMapper.map(event, EventDTO.class))
                .collect(Collectors.toList());
    }

    // Update
    public EventDTO updateEvent(Long id, EventDTO eventDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // enforce only EVENT_MANAGER allowed
        if (user.getRole() != UserRole.EVENT_MANAGER) {
            throw new RuntimeException("Unauthorized");
        }

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Partial update: only set when incoming value is not null
        if (eventDTO.getTitle() != null) event.setTitle(eventDTO.getTitle());
        if (eventDTO.getDescription() != null) event.setDescription(eventDTO.getDescription());
        if (eventDTO.getStartDate() != null) event.setStartDate(eventDTO.getStartDate());
        if (eventDTO.getEndDate() != null) event.setEndDate(eventDTO.getEndDate());
        if (eventDTO.getLocation() != null) event.setLocation(eventDTO.getLocation());
        if (eventDTO.getCoordinates() != null) event.setCoordinates(eventDTO.getCoordinates());
        if (eventDTO.getCategory() != null) event.setCategory(eventDTO.getCategory());
        if (eventDTO.getMaxParticipants() != null) event.setMaxParticipants(eventDTO.getMaxParticipants());
        if (eventDTO.getImageFile() != null) event.setImageFile(eventDTO.getImageFile());
        // do not change status unless you explicitly allow it here

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
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(EventStatus.APPROVED);
        event.setUpdatedAt(LocalDateTime.now());
        event = eventRepository.save(event);
        return modelMapper.map(event, EventDTO.class);
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
        // placeholder: nếu Event có trường socialChannel, dùng event.getSocialChannel()
        dto.setSocialChannelUrl("/events/" + event.getId() + "/social-channel");
        dto.setOtherInfo("Only accessible to admin, event manager, or approved volunteers");
        return dto;
    }
}