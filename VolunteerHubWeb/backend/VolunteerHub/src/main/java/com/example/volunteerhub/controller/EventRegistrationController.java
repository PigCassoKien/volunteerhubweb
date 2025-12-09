package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.EventHistoryRequestDTO;
import com.example.volunteerhub.dto.EventRegistrationDTO;
import com.example.volunteerhub.dto.EventRegistrationRequestDTO;
import com.example.volunteerhub.service.EventRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api/registrations")
public class EventRegistrationController {

    @Autowired
    private EventRegistrationService registrationService;

    @PostMapping("/register/{eventId}")
    @Operation(summary = "Register for an event", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventRegistrationDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventRegistrationDTO> registerEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody EventRegistrationRequestDTO request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(registrationService.registerEvent(eventId, request, email));
    }

    @GetMapping("/get/{id}")
    @Operation(summary = "Get registration by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventRegistrationDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventRegistrationDTO> getRegistrationById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(registrationService.getRegistrationById(id, email));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventRegistrationDTO>> getRegistrationsByEvent(@PathVariable Long eventId, Authentication authentication) {
        String email = (authentication.getPrincipal() instanceof UserDetails)
                ? ((UserDetails) authentication.getPrincipal()).getUsername()
                : authentication.getName();
        List<EventRegistrationDTO> list = registrationService.getRegistrationsByEvent(eventId, email);
        return ResponseEntity.ok(list);
    }

    // Read
    @PostMapping("/history")
    @Operation(summary = "Get user's registration history (filtered)", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventRegistrationDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventRegistrationDTO>> getHistory(@RequestBody(required = false) EventHistoryRequestDTO request, Authentication authentication) {
        String email = authentication.getName();
        List<EventRegistrationDTO> list = registrationService.getEventHistory(request, email);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/approve/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER')")
    public ResponseEntity<EventRegistrationDTO> approve(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(registrationService.approveRegistration(id, authentication.getName()));
    }

    @PutMapping("/complete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER','ROLE_ADMIN')")
    public ResponseEntity<EventRegistrationDTO> markComplete(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(registrationService.markComplete(id, authentication.getName()));
    }

    @PutMapping("/cancel/{id}")
    @Operation(summary = "Cancel event registration", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventRegistrationDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventRegistrationDTO> cancelRegistration(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(registrationService.cancelRegistration(id, email));
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete event registration", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER') or authentication.principal.email == #email")
    public ResponseEntity<Void> deleteRegistration(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        registrationService.deleteRegistration(id, email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count/{eventId}")
    @Operation(summary = "Count registrations by event and status", responses = {
            @ApiResponse(responseCode = "200", description = "Success")
    })
    public ResponseEntity<Integer> countByEventAndStatus(
            @PathVariable Long eventId,
            @RequestParam(required = false) com.example.volunteerhub.entity.enums.RegistrationStatus status) {
        int count = registrationService.countByEventAndStatus(eventId, status);
        return ResponseEntity.ok(count);
    }
}