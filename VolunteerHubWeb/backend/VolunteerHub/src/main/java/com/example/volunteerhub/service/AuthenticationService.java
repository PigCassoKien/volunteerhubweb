package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.AuthenticationResponse;
import com.example.volunteerhub.dto.LoginRequestDTO;
import com.example.volunteerhub.dto.UserResponseDTO;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    public AuthenticationResponse login(LoginRequestDTO loginRequest, String ipAddress) {

        // Xác thực email + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Lấy user từ DB
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

                // refuse login for locked/banned accounts
                if (user.getStatus() != null && user.getStatus().name().equals("BANNED")) {
                        throw new RuntimeException("Account locked");
                }

        // Tạo JWT token
        String jwtToken = jwtService.generateToken(user, ipAddress);

        // Convert sang DTO
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setAvatarFile(user.getAvatarFile());
        dto.setRole(user.getRole());

        // Trả về token + user
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(dto)
                .build();
    }
}
