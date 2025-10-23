package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.EventHistoryRequestDTO;
import com.example.volunteerhub.dto.EventRegistrationDTO;
import com.example.volunteerhub.dto.EventRegistrationRequestDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.EventStatus;
import com.example.volunteerhub.entity.enums.RegistrationStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.EventRegistrationRepository;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.UserRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.element.Paragraph;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.itextpdf.layout.Document;
import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventRegistrationService {

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Create
    public EventRegistrationDTO registerEvent(Long eventId, EventRegistrationRequestDTO request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getStatus() != EventStatus.APPROVED) {
            throw new RuntimeException("Event not approved");
        }

        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setRegisteredAt(LocalDateTime.now());

        // map form fields
        registration.setFullName(request.getFullName());
        registration.setGender(request.getGender());
        registration.setDateOfBirth(request.getDateOfBirth());
        registration.setAddress(request.getAddress());
        registration.setOccupation(request.getOccupation());
        registration.setAbout(request.getAbout());
        registration.setPhone(request.getPhone());
        registration.setContactEmail(request.getEmail());
        registration.setSchool(request.getSchool());
        registration.setExperience(request.getExperience());
        registration.setSkills(request.getSkills());
        registration.setConfirmation(request.getConfirmation());

        registration = registrationRepository.save(registration);
        return modelMapper.map(registration, EventRegistrationDTO.class);
    }

    // Read
    public EventRegistrationDTO getRegistrationById(Long id, String email) {
        EventRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        // If requester is the registered user -> allow
        if (registration.getUser() != null && email.equals(registration.getUser().getEmail())) {
            return modelMapper.map(registration, EventRegistrationDTO.class);
        }

        // Otherwise must be event manager who created the event
        User manager = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (manager.getRole() != UserRole.EVENT_MANAGER) {
            throw new RuntimeException("Forbidden");
        }

        Event event = registration.getEvent();
        if (event == null || event.getCreatedBy() == null || !email.equals(event.getCreatedBy().getEmail())) {
            throw new RuntimeException("Forbidden");
        }

        return modelMapper.map(registration, EventRegistrationDTO.class);
    }


    public List<EventRegistrationDTO> getRegistrationsByEvent(Long eventId, String email) {
        User manager = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (manager.getRole() != UserRole.EVENT_MANAGER) {
            throw new RuntimeException("Unauthorized");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getCreatedBy() == null || !email.equals(event.getCreatedBy().getEmail())) {
            throw new RuntimeException("Unauthorized: not the creator of the event");
        }

        return registrationRepository.findByEventId(eventId).stream()
                .map(reg -> modelMapper.map(reg, EventRegistrationDTO.class))
                .collect(Collectors.toList());
    }

    public List<EventRegistrationDTO> getEventHistory(EventHistoryRequestDTO request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<EventRegistration> registrations = registrationRepository.findEventHistory(
                user.getId(),
                request.getStatus(),
                request.getStartDate(),
                request.getEndDate(),
                request.getCategoryId()
        );
        List<EventRegistrationDTO> result = registrations.stream()
                .map(reg -> modelMapper.map(reg, EventRegistrationDTO.class))
                .collect(Collectors.toList());
        if ("dateAsc".equals(request.getSortBy())) {
            result.sort((a, b) -> {
                Event eventA = eventRepository.findById(a.getEventId()).orElseThrow();
                Event eventB = eventRepository.findById(b.getEventId()).orElseThrow();
                return eventA.getStartDate().compareTo(eventB.getStartDate());
            });
        } else if ("dateDesc".equals(request.getSortBy())) {
            result.sort((a, b) -> {
                Event eventA = eventRepository.findById(a.getEventId()).orElseThrow();
                Event eventB = eventRepository.findById(b.getEventId()).orElseThrow();
                return eventB.getStartDate().compareTo(eventA.getStartDate());
            });
        }
        return result;
    }

    // Update
    public EventRegistrationDTO approveRegistration(Long registrationId, String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (manager.getRole() != UserRole.EVENT_MANAGER) {
            throw new RuntimeException("Forbidden");
        }

        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        Event event = registration.getEvent();
        if (event == null || event.getCreatedBy() == null || !managerEmail.equals(event.getCreatedBy().getEmail())) {
            throw new RuntimeException("Forbidden");
        }

        registration.setStatus(RegistrationStatus.APPROVED);
        registrationRepository.save(registration);
        return modelMapper.map(registration, EventRegistrationDTO.class);
    }

    public EventRegistrationDTO markComplete(Long registrationId, String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        if (manager.getRole() != UserRole.EVENT_MANAGER && manager.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        registration.setStatus(RegistrationStatus.COMPLETED);
        registration.setCompletedAt(LocalDateTime.now());
        String certificatePath = generateCertificate(registration);
        registration = registrationRepository.save(registration);
        return modelMapper.map(registration, EventRegistrationDTO.class);
    }

    public EventRegistrationDTO cancelRegistration(Long registrationId, String email) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        if (!registration.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        if (registration.getEvent().getStartDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot cancel registration for past event");
        }
        registration.setStatus(RegistrationStatus.CANCELED);
        registration = registrationRepository.save(registration);
        return modelMapper.map(registration, EventRegistrationDTO.class);
    }

    // Delete
    public void deleteRegistration(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        EventRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        if (!registration.getUser().getEmail().equals(email) && user.getRole() != UserRole.EVENT_MANAGER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        registrationRepository.deleteById(id);
    }

    private String generateCertificate(EventRegistration registration) {
        try {
            String dest = "./Uploads/certificates/" + registration.getId() + "_certificate.pdf";
            File file = new File(dest);
            file.getParentFile().mkdirs();
            PdfWriter writer = new PdfWriter(dest);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.add(new Paragraph("Certificate of Participation")
                    .setFontSize(20).setBold());
            document.add(new Paragraph("This certifies that " + registration.getUser().getFullName()));
            document.add(new Paragraph("has successfully participated in " + registration.getEvent().getTitle()));
            document.add(new Paragraph("Date: " + registration.getCompletedAt().toString()));
            document.close();
            return dest;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate certificate", e);
        }
    }

    public boolean hasApproveRegistration(Long eventId, Long userId) {
        if (eventId == null || userId == null) return false;
        List<EventRegistration> regs = registrationRepository.findByEventId(eventId);
        return regs.stream()
                .anyMatch(r -> r.getUser() != null
                        && r.getUser().getId() != null
                        && r.getUser().getId().equals(userId)
                        && r.getStatus() == RegistrationStatus.APPROVED);
    }

    public boolean isUserRegistered(Long eventId, String email) {
        if (eventId == null || email == null) return false;
        List<EventRegistration> regs = registrationRepository.findByEventId(eventId);
        return regs.stream()
                .anyMatch(r -> r.getUser() != null
                        && email.equals(r.getUser().getEmail())
                        && r.getStatus() == RegistrationStatus.APPROVED);
    }
}