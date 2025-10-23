package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.dto.EventSocialDTO;
import com.example.volunteerhub.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

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


    @PutMapping("update/{id}")
    @Operation(summary = "Update event information", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_EVENT_MANAGER')")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDTO eventDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(eventService.updateEvent(id, eventDTO, email));
    }

    @DeleteMapping("delete/{id}")
    @Operation(summary = "Delete event", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        eventService.deleteEvent(id, email);
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