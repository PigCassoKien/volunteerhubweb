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
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

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

    @Autowired
    private NotificationService notificationService;
    
    // Create
    public EventRegistrationDTO registerEvent(Long eventId, EventRegistrationRequestDTO request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getStatus() != EventStatus.APPROVED) {
            throw new RuntimeException("Không thể đăng ký sự kiện chưa được duyệt");
        }

        // parse dateOfBirth (frontend should send "yyyy-MM-dd")
        LocalDate dob = null;
        try {
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                dob = LocalDate.parse(request.getDateOfBirth()); // ISO_LOCAL_DATE
            }
        } catch (DateTimeParseException ex) {
            throw new RuntimeException("dateOfBirth không hợp lệ. Định dạng yêu cầu: yyyy-MM-dd");
        }

        // minimal server-side validation (extra safety)
        if (request.getFullName() == null || request.getFullName().isBlank()) throw new RuntimeException("Họ tên là bắt buộc");
        if (request.getPhone() == null || request.getPhone().isBlank()) throw new RuntimeException("Số điện thoại là bắt buộc");
        if (request.getEmail() == null || request.getEmail().isBlank()) throw new RuntimeException("Email là bắt buộc");
        if (dob == null) throw new RuntimeException("Ngày sinh là bắt buộc");
        if (request.getConfirmation() == null || !request.getConfirmation()) throw new RuntimeException("Bạn phải xác nhận tham gia");

        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setRegisteredAt(LocalDateTime.now());

        // map form fields
        registration.setFullName(request.getFullName());
        registration.setGender(request.getGender());
        registration.setDateOfBirth(dob);
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

        EventRegistrationDTO dto = modelMapper.map(registration, EventRegistrationDTO.class);
        dto.setId(registration.getId());
        dto.setUserId(user.getId());
        dto.setEventId(event.getId());
        return dto;
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


    // Read registrations for an event (manager/admin only) and expose full form fields
    public List<EventRegistrationDTO> getRegistrationsByEvent(Long eventId, String requesterEmail) {
        // load event + requester
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // allow if requester is event manager (owner) or admin
        boolean isManager = requester.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && event.getCreatedBy().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() != null && requester.getRole().toString().contains("ADMIN");
        if (!isManager && !isAdmin) {
            throw new RuntimeException("Unauthorized to view registrations for this event");
        }

        List<EventRegistration> regs = registrationRepository.findByEventId(eventId);
        return regs.stream().map(r -> {
            EventRegistrationDTO dto = new EventRegistrationDTO();
            dto.setId(r.getId());
            dto.setUserId(r.getUser() != null ? r.getUser().getId() : null);
            dto.setEventId(r.getEvent() != null ? r.getEvent().getId() : null);
            dto.setStatus(r.getStatus());
            dto.setRegisteredAt(r.getRegisteredAt());
            dto.setCompletedAt(r.getCompletedAt());
            dto.setCertificateUrl(null); // set if you have it

            // full volunteer form fields
            dto.setFullName(r.getFullName());
            dto.setGender(r.getGender());
            dto.setDateOfBirth(r.getDateOfBirth());
            dto.setAddress(r.getAddress());
            dto.setOccupation(r.getOccupation());
            dto.setAbout(r.getAbout());
            dto.setPhone(r.getPhone());
            dto.setContactEmail(r.getContactEmail());
            dto.setSchool(r.getSchool());
            dto.setExperience(r.getExperience());
            dto.setSkills(r.getSkills());
            dto.setConfirmation(r.getConfirmation());

            // helpful event info
            dto.setEventTitle(r.getEvent() != null ? r.getEvent().getTitle() : null);
            dto.setEventStartDate(r.getEvent() != null ? r.getEvent().getStartDate() : null);
            dto.setEventLocation(r.getEvent() != null ? r.getEvent().getLocation() : null);
            return dto;
        }).collect(Collectors.toList());
    }

    // Read
    public List<EventRegistrationDTO> getEventHistory(EventHistoryRequestDTO request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<EventRegistration> regs = registrationRepository.findEventHistory(
                user.getId(),
                request != null ? request.getStatus() : null,
                request != null ? request.getStartDate() : null,
                request != null ? request.getEndDate() : null,
                request != null ? request.getCategoryId() : null
        );

        // Map and attach event metadata for frontend
        return regs.stream().map(reg -> {
            EventRegistrationDTO dto = modelMapper.map(reg, EventRegistrationDTO.class);
            dto.setId(reg.getId());
            dto.setUserId(reg.getUser() != null ? reg.getUser().getId() : null);
            dto.setEventId(reg.getEvent() != null ? reg.getEvent().getId() : null);
            dto.setStatus(reg.getStatus());
            dto.setRegisteredAt(reg.getRegisteredAt());
            dto.setCompletedAt(reg.getCompletedAt());

            if (reg.getEvent() != null) {
                dto.setEventTitle(reg.getEvent().getTitle());
                dto.setEventStartDate(reg.getEvent().getStartDate());
                dto.setEventLocation(reg.getEvent().getLocation());
            }

            // copy some profile/registration fields so UI can show role/notes
            dto.setFullName(reg.getFullName());
            dto.setPhone(reg.getPhone());
            dto.setExperience(reg.getExperience());
            dto.setSkills(reg.getSkills());
            dto.setCertificateUrl(null); // placeholder if you later add certificate field

            return dto;
        }).collect(Collectors.toList());
    }

    // Update
    public EventRegistrationDTO approveRegistration(Long registrationId, String managerEmail) {
        EventRegistration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(RegistrationStatus.APPROVED);
        reg.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        // NEW: notify user
        notificationService.notifyRegistrationStatusChange(reg.getUser().getId(), reg.getEvent().getId(), RegistrationStatus.APPROVED);

        return modelMapper.map(reg, EventRegistrationDTO.class);
    }

    public EventRegistrationDTO markComplete(Long registrationId, String managerEmail) {
        EventRegistration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(RegistrationStatus.COMPLETED);
        reg.setCompletedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        // NEW: notify user
        notificationService.notifyRegistrationStatusChange(reg.getUser().getId(), reg.getEvent().getId(), RegistrationStatus.COMPLETED);

        return modelMapper.map(reg, EventRegistrationDTO.class);
    }

    public EventRegistrationDTO cancelRegistration(Long registrationId, String email) {
        EventRegistration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(RegistrationStatus.CANCELED);
        reg.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        // NEW: notify user (if owner or manager triggered)
        notificationService.notifyRegistrationStatusChange(reg.getUser().getId(), reg.getEvent().getId(), RegistrationStatus.CANCELED);

        return modelMapper.map(reg, EventRegistrationDTO.class);
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

    public int countByEventAndStatus(Long eventId, com.example.volunteerhub.entity.enums.RegistrationStatus status) {
        if (status == null) {
            return registrationRepository.countByEventId(eventId);
        }
        return registrationRepository.countByEventIdAndStatus(eventId, status);
    }
}