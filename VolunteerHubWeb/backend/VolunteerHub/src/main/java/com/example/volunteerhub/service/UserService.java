package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.*;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.OtpType;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.entity.enums.UserStatus;
import com.example.volunteerhub.entity.enums.VerificationStatus;
import com.example.volunteerhub.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private OTPService otpService;

    private static final String PASSWORD_PATTERN = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    private void validatePassword(String password) {
        if (!password.matches(PASSWORD_PATTERN)) {
            throw new RuntimeException("Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.");
        }
    }


    // Create
    public UserResponseDTO registerUser(RegisterRequestDTO registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        validatePassword(registerRequest.getPassword());
        User user = modelMapper.map(registerRequest, User.class);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : UserRole.VOLUNTEER);
        user.setVerificationStatus(VerificationStatus.UNVERIFIED);
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus(UserStatus.INACTIVE);
        user = userRepository.save(user);


        otpService.generateAndSendOTP(user.getEmail(), OtpType.REGISTER);
        return modelMapper.map(user, UserResponseDTO.class);


    }

    // Read
    public UserResponseDTO getUserById(Long id, String currentUserEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getEmail().equals(currentUserEmail) && isAdmin(currentUserEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        return modelMapper.map(user, UserResponseDTO.class);
    }

    public List<UserResponseDTO> getAllUsers(String currentUserEmail) {
        if (isAdmin(currentUserEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserResponseDTO.class))
                .collect(Collectors.toList());
    }

    public List<UserResponseDTO> searchVolunteers(VolunteerSearchRequestDTO searchRequest) {
        List<User> volunteers;
        if (searchRequest.getKeyword() != null && !searchRequest.getKeyword().isEmpty()) {
            volunteers = userRepository.searchVolunteersByKeyword(searchRequest.getKeyword());
        } else {
            volunteers = userRepository.findByRole(UserRole.VOLUNTEER);
        }
        return volunteers.stream()
                .map(user -> modelMapper.map(user, UserResponseDTO.class))
                .collect(Collectors.toList());
    }

    // Update
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO userDTO, String currentUserEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getEmail().equals(currentUserEmail) && !isAdmin(currentUserEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        if (userDTO.getFullName() != null) user.setFullName(userDTO.getFullName());
        if (userDTO.getPhoneNumber() != null) user.setPhoneNumber(userDTO.getPhoneNumber());
        if (userDTO.getAddress() != null) user.setAddress(userDTO.getAddress());
        if (userDTO.getAvatarFile() != null) user.setAvatarFile(userDTO.getAvatarFile());
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        return modelMapper.map(user, UserResponseDTO.class);
    }


    public UserResponseDTO assignRole(AssignRoleRequestDTO request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(request.getRole());
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        return modelMapper.map(user, UserResponseDTO.class);
    }

    public void lockUser(Long userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.BANNED);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void unlockUser(Long userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // Delete
    public void deleteUser(Long id, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        userRepository.deleteById(id);
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (oldPassword != null && !passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        validatePassword(newPassword);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private boolean isAdmin(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getRole() == UserRole.ADMIN)
                .orElse(false);
    }

    public void resetPassword(String email, String code, String newPassword) {
        otpService.verifyOTP(email, code, OtpType.RESET_PASSWORD);
        validatePassword(newPassword);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Scheduled(fixedRate = 60000) // runs every minute
    public void deleteExpiredUnverifiedUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        List<User> expiredUsers = userRepository.findByVerificationStatusAndCreatedAtBefore(
                VerificationStatus.UNVERIFIED, threshold
        );
        // Also delete related entities if needed (implement cascade or manual deletion)
        userRepository.deleteAll(expiredUsers);
    }
}