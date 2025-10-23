package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.AuthenticationResponse;
import com.example.volunteerhub.dto.LoginRequestDTO;
import com.example.volunteerhub.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    @Operation(summary = "User login", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthenticationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "X-Forwarded-For", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "127.0.0.1", required = false)
    })
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody LoginRequestDTO loginRequest, @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        return ResponseEntity.ok(authenticationService.login(loginRequest, ipAddress));
    }
}