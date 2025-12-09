package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.dto.EventSocialDTO;
import com.example.volunteerhub.entity.Category;
import com.example.volunteerhub.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    // optional per-project override for event uploads; if set absolute or relative it's resolved
    @Value("${event.upload.dir:}")
    private String eventUploadDir;

    // Multipart create: accepts one image file (imageFile)
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new event (with optional image)")
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<EventDTO> createEventMultipart(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "maxParticipants", required = false) Integer maxParticipants,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            Authentication authentication
    ) throws Exception {
        try {
            System.out.println("[EventController] createEventMultipart received: title=" + title + ", startDate=" + startDate + ", endDate=" + endDate + ", categoryId=" + categoryId);

            // Parse start/end into LocalDateTime with tolerant parsing
            LocalDateTime startDt = parseToLocalDateTime(startDate);
            LocalDateTime endDt = parseToLocalDateTime(endDate);
            if (startDt == null || endDt == null) {
                throw new RuntimeException("Không thể đọc ngày bắt đầu/ket thúc. Định dạng hợp lệ: yyyy-MM-dd'T'HH:mm[:ss] hoặc ISO_OFFSET_DATE_TIME.");
            }

            // build DTO to pass to service (reuse EventDTO)
            EventDTO dto = new EventDTO();
            dto.setTitle(title);
            dto.setDescription(description);
            dto.setLocation(location);
            // parse startDate / endDate using same helper as other endpoints (expecting ISO datetime)
            dto.setStartDate(LocalDateTime.parse(startDate));
            dto.setEndDate(LocalDateTime.parse(endDate));
            dto.setCategory(categoryId == null ? null : new Category() {{ setId(categoryId); }});
            dto.setMaxParticipants(maxParticipants);

            // handle image save similar to previous impl (store file -> dto.setImageFile(...))
            if (imageFile != null && !imageFile.isEmpty()) {
                Path dest = Path.of(uploadDir).toAbsolutePath().resolve("events");
                Files.createDirectories(dest);
                String filename = System.currentTimeMillis() + "-" + imageFile.getOriginalFilename();
                Files.copy(imageFile.getInputStream(), dest.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
                dto.setImageFile("events/" + filename);
            }

            String email = (authentication.getPrincipal() instanceof UserDetails)
                    ? ((UserDetails) authentication.getPrincipal()).getUsername()
                    : authentication.getName();

            EventDTO created = eventService.createEvent(dto, email);
            return ResponseEntity.ok(created);
        } catch (DateTimeParseException dtp) {
            throw new RuntimeException("Ngày không hợp lệ: " + dtp.getMessage());
        } catch (RuntimeException re) {
            // propagate with message for frontend
            throw re;
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo sự kiện: " + ex.getMessage());
        }
    }

    // Multipart update (allows replacing/adding image)
    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER','ROLE_ADMIN')")
    public ResponseEntity<EventDTO> updateEventMultipart(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            Authentication authentication
    ) throws Exception {
        EventDTO dto = new EventDTO();
        dto.setId(id);
        if (title != null) dto.setTitle(title);
        if (description != null) dto.setDescription(description);
        if (location != null) dto.setLocation(location);
        if (startDate != null) dto.setStartDate(LocalDateTime.parse(startDate));
        if (endDate != null) dto.setEndDate(LocalDateTime.parse(endDate));
        if (categoryId != null) {
            com.example.volunteerhub.entity.Category c = new com.example.volunteerhub.entity.Category();
            c.setId(categoryId);
            dto.setCategory(c);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            Path baseRoot = (eventUploadDir != null && !eventUploadDir.isBlank())
                    ? Path.of(eventUploadDir).toAbsolutePath().normalize()
                    : Path.of(uploadDir).toAbsolutePath().normalize();
            Path baseDir = baseRoot.resolve("events");
            Files.createDirectories(baseDir);
            String original = Path.of(imageFile.getOriginalFilename()).getFileName().toString();
            String filename = System.currentTimeMillis() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path target = baseDir.resolve(filename);
            Files.copy(imageFile.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("[EventController] saved event image -> " + target.toAbsolutePath());
            dto.setImageFile("events/" + filename);
        }

        EventDTO updated = eventService.updateEvent(id, dto, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/create")
    @Operation(summary = "Create a new event", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<EventDTO> createEvent(@Valid @org.springframework.web.bind.annotation.RequestBody EventDTO eventDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(eventService.createEvent(eventDTO, email));
    }

    @GetMapping("/get/{id}")
    @Operation(summary = "Get event by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventDTO.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all events", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventDTO.class)))
    })
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get events by category", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventDTO.class)))
    })
    public ResponseEntity<List<EventDTO>> getEventsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(eventService.getEventsByCategory(categoryId));
    }

    // java
    @GetMapping("/date-range")
    @Operation(summary = "Get events by date range", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<?> getEventsByDateRange(
            @RequestParam String start,
            @RequestParam String end) {
        try {
            LocalDateTime s = parseToLocalDateTime(start);
            LocalDateTime e = parseToLocalDateTime(end);
            return ResponseEntity.ok(eventService.getEventsByDateRange(s, e));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    private LocalDateTime parseToLocalDateTime(String value) {
        if (value == null) throw new IllegalArgumentException("Datetime value is required");
        String s = value.trim();
        // strip surrounding single/double quotes if present
        if ((s.startsWith("\"") && s.endsWith("\"")) || (s.startsWith("'") && s.endsWith("'"))) {
            s = s.substring(1, s.length() - 1).trim();
        }
        try {
            return LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException ex1) {
            try {
                return OffsetDateTime.parse(s, DateTimeFormatter.ISO_OFFSET_DATE_TIME).toLocalDateTime();
            } catch (DateTimeParseException ex2) {
                throw new IllegalArgumentException("Invalid datetime format: " + value + ". Use yyyy-MM-dd'T'HH:mm:ss or include offset like yyyy-MM-dd'T'HH:mm:ss+07:00");
            }
        }
    }

    @GetMapping("/my")
    @Operation(summary = "Get events created by authenticated user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventDTO>> getMyEvents(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(eventService.getEventsByManager(email));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER','ROLE_ADMIN')")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @RequestBody EventDTO dto, Authentication authentication) {
        EventDTO updated = eventService.updateEvent(id, dto, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER','ROLE_ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, Authentication authentication) {
        eventService.deleteEvent(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/approve/{id}")
    @Operation(summary = "Approve event", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<EventDTO> approveEvent(@PathVariable Long id, Authentication authentication) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(eventService.approveEvent(id, adminEmail));


    }

    @GetMapping("/{id}/social")
    @Operation(summary = "Get event social channel. Accessible only to admin, event manager, or volunteers who registered successfully.")
    public ResponseEntity<EventSocialDTO> getEventSocial(@PathVariable Long id, Authentication authentication) {
        String email = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        boolean allowed = eventService.canAccessEventSocial(id, email);
        if (!allowed) {
            return ResponseEntity.status(403).build();
        }
        EventSocialDTO eventSocialDTO = eventService.getEventSocial(id);
        return ResponseEntity.ok(eventSocialDTO);
    }

}