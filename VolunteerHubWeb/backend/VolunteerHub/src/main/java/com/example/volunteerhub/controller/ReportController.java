package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.EventReportDTO;
import com.example.volunteerhub.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.security.Principal;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get event report", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = EventReportDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Not Found")
    })
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<EventReportDTO> getEventReport(@PathVariable Long eventId, Principal principal) {
        // Principal is provided by Spring Security; no email-in-header required.
        return ResponseEntity.ok(reportService.getEventReport(eventId));
    }

    @GetMapping("/export-participants/{eventId}")
    @Operation(summary = "Export participants report", responses = {
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Not Found")
    })
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<InputStreamResource> exportParticipants(@PathVariable Long eventId, Principal principal) throws Exception {
        File file = reportService.exportParticipants(eventId);
        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        String disposition = "attachment; filename=\"" + file.getName() + "\"";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(file.length())
                .body(resource);
    }
}
