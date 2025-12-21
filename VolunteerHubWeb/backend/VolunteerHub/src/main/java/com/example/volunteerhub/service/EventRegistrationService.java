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
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.kernel.colors.DeviceRgb;
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

        if (event.getStartDate() != null && LocalDateTime.now().isAfter(event.getStartDate())) {
            throw new RuntimeException("Không thể đăng ký sau khi sự kiện đã bắt đầu");
        }
        if (event.getEndDate() != null && LocalDateTime.now().isAfter(event.getEndDate())) {
            throw new RuntimeException("Không thể đăng ký sự kiện đã kết thúc");
        }

        LocalDate dob = null;
        try {
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                dob = LocalDate.parse(request.getDateOfBirth()); // ISO_LOCAL_DATE
            }
        } catch (DateTimeParseException ex) {
            throw new RuntimeException("dateOfBirth không hợp lệ. Định dạng yêu cầu: yyyy-MM-dd");
        }

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

        if (registration.getUser() != null && email.equals(registration.getUser().getEmail())) {
            return modelMapper.map(registration, EventRegistrationDTO.class);
        }

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


    public List<EventRegistrationDTO> getRegistrationsByEvent(Long eventId, String requesterEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
            String certPath = "./Uploads/certificates/" + r.getId() + "_certificate.pdf";
            File certFile = new File(certPath);
            if (certFile.exists()) {
                dto.setCertificateUrl("/uploads/certificates/" + r.getId() + "_certificate.pdf");
            } else {
                dto.setCertificateUrl(null);
            }

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

            dto.setEventTitle(r.getEvent() != null ? r.getEvent().getTitle() : null);
            dto.setEventStartDate(r.getEvent() != null ? r.getEvent().getStartDate() : null);
            dto.setEventLocation(r.getEvent() != null ? r.getEvent().getLocation() : null);
            dto.setCancellationReason(r.getCancellationReason());
            dto.setCanceledAt(r.getCanceledAt());
            dto.setCanceledByName(r.getCanceledBy() != null ? r.getCanceledBy().getFullName() : null);
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

            dto.setFullName(reg.getFullName());
            dto.setPhone(reg.getPhone());
            dto.setExperience(reg.getExperience());
            dto.setSkills(reg.getSkills());
            String certPath = "./Uploads/certificates/" + reg.getId() + "_certificate.pdf";
            File certFile = new File(certPath);
            if (certFile.exists()) {
                dto.setCertificateUrl("/uploads/certificates/" + reg.getId() + "_certificate.pdf");
            } else {
                dto.setCertificateUrl(null);
            }
            dto.setCancellationReason(reg.getCancellationReason());
            dto.setCanceledAt(reg.getCanceledAt());
            dto.setCanceledByName(reg.getCanceledBy() != null ? reg.getCanceledBy().getFullName() : null);

            return dto;
        }).collect(Collectors.toList());
    }

    public List<EventRegistrationDTO> getRegistrationsByUserId(Long userId) {
        List<EventRegistration> regs = registrationRepository.findByUserId(userId);
        if (regs == null) return new ArrayList<>();

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

            dto.setFullName(reg.getFullName());
            dto.setPhone(reg.getPhone());
            dto.setExperience(reg.getExperience());
            dto.setSkills(reg.getSkills());
            String certPath = "./Uploads/certificates/" + reg.getId() + "_certificate.pdf";
            File certFile = new File(certPath);
            if (certFile.exists()) {
                dto.setCertificateUrl("/uploads/certificates/" + reg.getId() + "_certificate.pdf");
            } else {
                dto.setCertificateUrl(null);
            }
            dto.setCancellationReason(reg.getCancellationReason());
            dto.setCanceledAt(reg.getCanceledAt());
            dto.setCanceledByName(reg.getCanceledBy() != null ? reg.getCanceledBy().getFullName() : null);

            return dto;
        }).collect(Collectors.toList());
    }

    // Update
    public EventRegistrationDTO approveRegistration(Long registrationId, String managerEmail) {
        EventRegistration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(RegistrationStatus.APPROVED);
        reg.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        notificationService.notifyRegistrationStatusChange(reg.getUser().getId(), reg.getEvent().getId(), RegistrationStatus.APPROVED);

        return modelMapper.map(reg, EventRegistrationDTO.class);
    }

    public EventRegistrationDTO markComplete(Long registrationId, String managerEmail) {
        EventRegistration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(RegistrationStatus.COMPLETED);
        reg.setCompletedAt(LocalDateTime.now());
        registrationRepository.save(reg);

        notificationService.notifyRegistrationStatusChange(reg.getUser().getId(), reg.getEvent().getId(), RegistrationStatus.COMPLETED);
        try {
            String path = generateCertificate(reg);
        } catch (Exception ex) {
        }

        EventRegistrationDTO dto = modelMapper.map(reg, EventRegistrationDTO.class);
        String possible = "/uploads/certificates/" + reg.getId() + "_certificate.pdf";
        File f = new File("./Uploads/certificates/" + reg.getId() + "_certificate.pdf");
        if (f.exists()) dto.setCertificateUrl(possible);
        return dto;
    }

    public String generateCertificateForRegistration(Long registrationId, String requesterEmail) {
        EventRegistration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new RuntimeException("Registration not found"));

        boolean isOwner = reg.getUser() != null && reg.getUser().getEmail() != null && reg.getUser().getEmail().equals(requesterEmail);
        boolean isManager = false;
        boolean isAdmin = false;
        if (requesterEmail != null) {
            User requester = userRepository.findByEmail(requesterEmail).orElse(null);
            if (requester != null) {
                isManager = requester.getRole() == UserRole.EVENT_MANAGER && reg.getEvent() != null && reg.getEvent().getCreatedBy() != null && reg.getEvent().getCreatedBy().getId().equals(requester.getId());
                isAdmin = requester.getRole() != null && requester.getRole().toString().contains("ADMIN");
            }
        }

        if (!isOwner && !isManager && !isAdmin) {
            throw new RuntimeException("Unauthorized to generate certificate");
        }

        try {
            String path = generateCertificate(reg);
            String publicUrl = "/uploads/certificates/" + reg.getId() + "_certificate.pdf";
            File f = new File(path);
            if (f.exists()) return publicUrl;
            return null;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate certificate", ex);
        }
    }

    public EventRegistrationDTO cancelRegistration(Long registrationId, String email, String reason) {
        EventRegistration reg = registrationRepository.findById(registrationId).orElseThrow(() -> new RuntimeException("Registration not found"));
        Event event = reg.getEvent();
        User requester = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = reg.getUser() != null && reg.getUser().getEmail().equals(email);
        boolean isManager = requester.getRole() == UserRole.EVENT_MANAGER && event.getCreatedBy() != null && event.getCreatedBy().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() != null && requester.getRole().toString().contains("ADMIN");

        if (isOwner) {
            if (event.getStartDate() != null && LocalDateTime.now().isAfter(event.getStartDate())) {
                throw new RuntimeException("Không thể huỷ đăng ký sau khi sự kiện đã bắt đầu");
            }
        } else if (!isManager && !isAdmin) {
            throw new RuntimeException("Unauthorized");
        }

        reg.setStatus(RegistrationStatus.CANCELED);
        reg.setUpdatedAt(LocalDateTime.now());
        reg.setCancellationReason(reason);
        reg.setCanceledAt(LocalDateTime.now());
        if (!isOwner) {
            reg.setCanceledBy(requester);
        } else {
            reg.setCanceledBy(reg.getUser());
        }

        registrationRepository.save(reg);

        notificationService.notifyRegistrationStatusChange(reg.getUser().getId(), reg.getEvent().getId(), RegistrationStatus.CANCELED);

        EventRegistrationDTO dto = modelMapper.map(reg, EventRegistrationDTO.class);
        dto.setCancellationReason(reg.getCancellationReason());
        dto.setCanceledAt(reg.getCanceledAt());
        dto.setCanceledByName(reg.getCanceledBy() != null ? reg.getCanceledBy().getFullName() : null);
        return dto;
    }

    public void completeRegistrationsForEvent(Long eventId, String requesterEmail) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        User requester = userRepository.findByEmail(requesterEmail).orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManager = requester.getRole() == UserRole.EVENT_MANAGER && event.getCreatedBy() != null && event.getCreatedBy().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() != null && requester.getRole().toString().contains("ADMIN");
        if (!isManager && !isAdmin) throw new RuntimeException("Unauthorized");

        if (event.getEndDate() == null) return; // nothing to do
        if (!LocalDateTime.now().isAfter(event.getEndDate())) return; // not ended yet

        List<EventRegistration> regs = registrationRepository.findByEventId(eventId);
        for (EventRegistration r : regs) {
            if (r.getStatus() != RegistrationStatus.COMPLETED) {
                r.setStatus(RegistrationStatus.COMPLETED);
                r.setCompletedAt(LocalDateTime.now());
                registrationRepository.save(r);
                try {
                    notificationService.notifyRegistrationStatusChange(r.getUser().getId(), eventId, RegistrationStatus.COMPLETED);
                } catch (Exception ex) {
                }
            }
        }
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

            String fontPath = null;
            String[] candidates = new String[]{
                    "src/main/resources/fonts/DejaVuSans.ttf",
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                    "C:\\Windows\\Fonts\\arial.ttf",
                    "C:\\Windows\\Fonts\\times.ttf"
            };
            for (String p : candidates) {
                if (p == null) continue;
                File f = new File(p);
                if (f.exists()) {
                    fontPath = p;
                    break;
                }
            }

            PdfWriter writer = new PdfWriter(dest);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(72, 72, 72, 72);

            PdfFont font;
            if (fontPath != null) {
                font = PdfFontFactory.createFont(fontPath, PdfEncodings.IDENTITY_H, PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
            } else {
                font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            }

            document.setFont(font);

            Div box = new Div();
            box.setBorder(new SolidBorder(new DeviceRgb(200, 200, 200), 1));
            box.setPadding(20);

            Paragraph title = new Paragraph("GIẤY CHỨNG NHẬN")
                    .setFontSize(28)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            box.add(title);

            box.add(new Paragraph(" ")); // spacer

            String fullName = registration.getFullName() != null && !registration.getFullName().isBlank()
                    ? registration.getFullName()
                    : (registration.getUser() != null ? registration.getUser().getFullName() : "");
            Paragraph recipient = new Paragraph(fullName)
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            box.add(recipient);

            box.add(new Paragraph(" "));

            String eventTitle = registration.getEvent() != null ? registration.getEvent().getTitle() : "";
            Paragraph body = new Paragraph()
                    .add("Đã hoàn thành tham gia sự kiện: ")
                    .add(eventTitle)
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER);
            box.add(body);

            box.add(new Paragraph(" "));

            String date = registration.getCompletedAt() != null ? registration.getCompletedAt().toLocalDate().toString() : "";
            Paragraph dateP = new Paragraph("Ngày: " + date)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER);
            box.add(dateP);

            box.add(new Paragraph(" "));

            Paragraph sig = new Paragraph("Ban tổ chức")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.RIGHT);
            box.add(sig);

            document.add(box);
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