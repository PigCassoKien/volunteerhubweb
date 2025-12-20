package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.*;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.OtpType;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.entity.enums.RegistrationStatus;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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

    @Autowired
    private com.example.volunteerhub.repository.EventRepository eventRepository;

    @Autowired
    private com.example.volunteerhub.repository.EventRegistrationRepository eventRegistrationRepository;

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
        // keep existing behavior for callers who rely on it: simply return mapping
        return modelMapper.map(user, UserResponseDTO.class);
    }

    /**
     * Public profile view accessible without authentication.
     * Returns a `UserResponseDTO` mapped from entity. If you want to hide
     * sensitive fields for anonymous callers, filter them here.
     */
    public UserResponseDTO getPublicProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserResponseDTO dto = modelMapper.map(user, UserResponseDTO.class);
        // Optionally remove or mask sensitive info for anonymous viewers.
        // For now we return public fields as-is; adjust if needed.
        return dto;
    }

    public String uploadAvatar(Long id, org.springframework.web.multipart.MultipartFile avatar, String currentUserEmail) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        // Only allow owner or admin to upload
        if (!user.getEmail().equals(currentUserEmail) && !isAdmin(currentUserEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }

        if (avatar == null || avatar.isEmpty()) {
            throw new RuntimeException("No file");
        }

        try {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }

            String original = avatar.getOriginalFilename();
            String ext = "";
            if (original != null) {
                int dot = original.lastIndexOf('.');
                if (dot >= 0) ext = original.substring(dot);
            }
            String fileName = "avatar_" + java.util.UUID.randomUUID().toString() + ext;
            java.nio.file.Path target = uploadDir.resolve(fileName);

            try (java.io.InputStream in = avatar.getInputStream()) {
                java.nio.file.Files.copy(in, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }

            user.setAvatarFile(fileName);
            user.setUpdatedAt(java.time.LocalDateTime.now());
            userRepository.save(user);

            return fileName;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to save file");
        }
    }

    public List<UserResponseDTO> getAllUsers(String currentUserEmail) {
        // ensure caller is admin
        User caller = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Caller not found"));
        if (caller.getRole() != UserRole.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }

        List<User> all = userRepository.findAll();
        if (all.isEmpty()) return java.util.Collections.emptyList();

        java.util.List<Long> userIds = all.stream().map(User::getId).toList();

        java.util.Map<Long, Integer> countsMap = new java.util.HashMap<>();
        java.util.Map<Long, Integer> hoursMap = new java.util.HashMap<>();

        try {
            java.util.List<Object[]> counts = eventRegistrationRepository.findRegistrationCountsByUserIds(userIds);
            for (Object[] r : counts) {
                Number uid = (Number) r[0];
                Number cnt = (Number) r[1];
                if (uid != null) countsMap.put(uid.longValue(), cnt != null ? cnt.intValue() : 0);
            }
        } catch (Exception ex) {
            // ignore and leave countsMap empty
        }

        try {
            // Compute hours per user with daily cap (max 8 hours per calendar day).
            for (Long uid : userIds) {
                java.util.List<com.example.volunteerhub.entity.EventRegistration> regs = eventRegistrationRepository.findByUserId(uid);
                if (regs == null || regs.isEmpty()) {
                    hoursMap.put(uid, 0);
                    continue;
                }

                java.util.Map<java.time.LocalDate, Double> daily = new java.util.HashMap<>();
                for (com.example.volunteerhub.entity.EventRegistration r : regs) {
                    if (r.getEvent() == null || r.getEvent().getStartDate() == null || r.getEvent().getEndDate() == null) continue;
                    java.time.LocalDateTime s = r.getEvent().getStartDate();
                    java.time.LocalDateTime e = r.getEvent().getEndDate();
                    if (e.isBefore(s)) continue;

                    java.time.LocalDate cur = s.toLocalDate();
                    java.time.LocalDate last = e.toLocalDate();
                    while (!cur.isAfter(last)) {
                        java.time.LocalDateTime dayStart = cur.atStartOfDay();
                        java.time.LocalDateTime dayEnd = dayStart.plusDays(1);
                        java.time.LocalDateTime overlapStart = s.isAfter(dayStart) ? s : dayStart;
                        java.time.LocalDateTime overlapEnd = e.isBefore(dayEnd) ? e : dayEnd;
                        if (overlapEnd.isAfter(overlapStart)) {
                            long minutes = java.time.Duration.between(overlapStart, overlapEnd).toMinutes();
                            double hrs = minutes / 60.0;
                            daily.put(cur, daily.getOrDefault(cur, 0.0) + hrs);
                        }
                        cur = cur.plusDays(1);
                    }
                }

                double total = 0.0;
                for (Double d : daily.values()) {
                    total += Math.min(8.0, d);
                }
                hoursMap.put(uid, (int) Math.floor(total));
            }
        } catch (Exception ex) {
            // fallback to SQL summation if complex logic fails
            try {
                java.util.List<Object[]> hrs = eventRegistrationRepository.findHoursSumByUserIds(userIds);
                for (Object[] r : hrs) {
                    Number uid = (Number) r[0];
                    Number h = (Number) r[1];
                    if (uid != null) hoursMap.put(uid.longValue(), h != null ? h.intValue() : 0);
                }
            } catch (Exception ex2) {
                // ignore
            }
        }

        return all.stream().map(u -> {
            UserResponseDTO dto = modelMapper.map(u, UserResponseDTO.class);
            dto.setEventsCount(countsMap.getOrDefault(u.getId(), 0));
            dto.setHours(hoursMap.getOrDefault(u.getId(), 0));
            return dto;
        }).collect(Collectors.toList());
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
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (admin.getRole() != com.example.volunteerhub.entity.enums.UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }

        User target = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        // do not allow demoting last admin (simple safeguard)
        if (target.getRole() == com.example.volunteerhub.entity.enums.UserRole.ADMIN
                && request.getRole() != com.example.volunteerhub.entity.enums.UserRole.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.example.volunteerhub.entity.enums.UserRole.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot remove role from the last admin");
            }
        }

        target.setRole(request.getRole());
        target.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(target);

        return modelMapper.map(target, UserResponseDTO.class);
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

    public Page<UserResponseDTO> searchVolunteersPage(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<User> result;
        if (keyword != null && !keyword.trim().isEmpty()) {
            result = userRepository.searchVolunteers(keyword.trim(), UserRole.VOLUNTEER, pageable);
        } else {
            result = userRepository.findAll(pageable).map(u -> u).map(u -> u); // placeholder, will filter by role below
            // there is no direct repository.findByRole with pageable defined, so fallback to findAll and filter
            result = result.map(user -> user);
        }

        // Build events/ hours maps for users in page
        java.util.List<User> usersOnPage = result.getContent();
        java.util.List<Long> userIds = usersOnPage.stream().map(User::getId).toList();

        java.util.Map<Long, Integer> countsMap = new java.util.HashMap<>();
        java.util.Map<Long, Integer> hoursMap = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            try {
                java.util.List<Object[]> counts = eventRegistrationRepository.findRegistrationCountsByUserIds(userIds);
                for (Object[] r : counts) {
                    Number uid = (Number) r[0];
                    Number cnt = (Number) r[1];
                    if (uid != null) countsMap.put(uid.longValue(), cnt != null ? cnt.intValue() : 0);
                }
            } catch (Exception ex) {
                // ignore and leave countsMap empty
            }

            try {
                // Compute hours per user with daily cap (max 8 hours per calendar day).
                for (Long uid : userIds) {
                    java.util.List<com.example.volunteerhub.entity.EventRegistration> regs = eventRegistrationRepository.findByUserId(uid);
                    if (regs == null || regs.isEmpty()) {
                        hoursMap.put(uid, 0);
                        continue;
                    }

                    java.util.Map<java.time.LocalDate, Double> daily = new java.util.HashMap<>();
                    for (com.example.volunteerhub.entity.EventRegistration r : regs) {
                        if (r.getEvent() == null || r.getEvent().getStartDate() == null || r.getEvent().getEndDate() == null) continue;
                        java.time.LocalDateTime s = r.getEvent().getStartDate();
                        java.time.LocalDateTime e = r.getEvent().getEndDate();
                        if (e.isBefore(s)) continue;

                        java.time.LocalDate cur = s.toLocalDate();
                        java.time.LocalDate last = e.toLocalDate();
                        while (!cur.isAfter(last)) {
                            java.time.LocalDateTime dayStart = cur.atStartOfDay();
                            java.time.LocalDateTime dayEnd = dayStart.plusDays(1);
                            java.time.LocalDateTime overlapStart = s.isAfter(dayStart) ? s : dayStart;
                            java.time.LocalDateTime overlapEnd = e.isBefore(dayEnd) ? e : dayEnd;
                            if (overlapEnd.isAfter(overlapStart)) {
                                long minutes = java.time.Duration.between(overlapStart, overlapEnd).toMinutes();
                                double hrs = minutes / 60.0;
                                daily.put(cur, daily.getOrDefault(cur, 0.0) + hrs);
                            }
                            cur = cur.plusDays(1);
                        }
                    }

                    double total = 0.0;
                    for (Double d : daily.values()) {
                        total += Math.min(8.0, d);
                    }
                    hoursMap.put(uid, (int) Math.floor(total));
                }
            } catch (Exception ex) {
                // fallback to existing sql query when something unexpected happens
                try {
                    java.util.List<Object[]> hrs = eventRegistrationRepository.findHoursSumByUserIds(userIds);
                    for (Object[] r : hrs) {
                        Number uid = (Number) r[0];
                        Number h = (Number) r[1];
                        if (uid != null) hoursMap.put(uid.longValue(), h != null ? h.intValue() : 0);
                    }
                } catch (Exception ex2) {
                    // ignore
                }
            }
        }

        java.util.List<UserResponseDTO> dtos = new java.util.ArrayList<>();
        for (User u : usersOnPage) {
            UserResponseDTO dto = modelMapper.map(u, UserResponseDTO.class);
            dto.setEventsCount(countsMap.getOrDefault(u.getId(), 0));
            dto.setHours(hoursMap.getOrDefault(u.getId(), 0));
            dtos.add(dto);
        }

        Page<UserResponseDTO> dtoPage = new PageImpl<>(dtos, pageable, result.getTotalElements());
        return dtoPage;
    }

    public com.example.volunteerhub.dto.CommunityStatsDTO getCommunityStats() {
        long totalVolunteers = userRepository.countByRole(UserRole.VOLUNTEER);
        long provinces = userRepository.countDistinctAddressByRole(UserRole.VOLUNTEER);
        long totalEvents = eventRepository.count();
        long totalRegistrations = eventRegistrationRepository.count();

        com.example.volunteerhub.dto.CommunityStatsDTO dto = new com.example.volunteerhub.dto.CommunityStatsDTO();
        dto.setTotalVolunteers(totalVolunteers);
        dto.setProvincesCount(provinces);
        dto.setTotalEvents(totalEvents);
        dto.setTotalRegistrations(totalRegistrations);
        return dto;
    }

    public java.util.List<com.example.volunteerhub.dto.VolunteerRankDTO> getTopVolunteers(int limit) {
        int safeLimit = Math.max(1, limit);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, safeLimit);
        java.util.List<com.example.volunteerhub.entity.enums.RegistrationStatus> statuses = java.util.Arrays.asList(com.example.volunteerhub.entity.enums.RegistrationStatus.APPROVED, com.example.volunteerhub.entity.enums.RegistrationStatus.COMPLETED);
        java.util.List<Object[]> rows = eventRegistrationRepository.findTopVolunteersByRegistrationCounts(statuses, pageable);
        java.util.List<com.example.volunteerhub.dto.VolunteerRankDTO> out = new java.util.ArrayList<>();
        // gather userIds to compute hours in batch
        java.util.List<Long> userIds = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            Number userIdNum = (Number) row[0];
            Number cnt = (Number) row[1];
            Long userId = userIdNum != null ? userIdNum.longValue() : null;
            int registrations = cnt != null ? cnt.intValue() : 0;
            com.example.volunteerhub.dto.VolunteerRankDTO dto = new com.example.volunteerhub.dto.VolunteerRankDTO();
            dto.setUserId(userId);
            if (userId != null) {
                java.util.Optional<com.example.volunteerhub.entity.User> uOpt = userRepository.findById(userId);
                if (uOpt.isPresent()) {
                    com.example.volunteerhub.entity.User u = uOpt.get();
                    dto.setFullName(u.getFullName());
                    dto.setAvatarFile(u.getAvatarFile());
                } else {
                    dto.setFullName("Unknown");
                }
            }
            dto.setRegistrations(registrations);
            out.add(dto);
            if (userId != null) userIds.add(userId);
        }

        // compute hours for each user (apply 8-hour daily cap)
        java.util.Map<Long, Integer> hoursMap = new java.util.HashMap<>();
        try {
            for (Long uid : userIds) {
                java.util.List<com.example.volunteerhub.entity.EventRegistration> regs = eventRegistrationRepository.findByUserId(uid);
                if (regs == null || regs.isEmpty()) {
                    hoursMap.put(uid, 0);
                    continue;
                }

                java.util.Map<java.time.LocalDate, Double> daily = new java.util.HashMap<>();
                for (com.example.volunteerhub.entity.EventRegistration r : regs) {
                    if (r.getEvent() == null || r.getEvent().getStartDate() == null || r.getEvent().getEndDate() == null) continue;
                    java.time.LocalDateTime s = r.getEvent().getStartDate();
                    java.time.LocalDateTime e = r.getEvent().getEndDate();
                    if (e.isBefore(s)) continue;

                    java.time.LocalDate cur = s.toLocalDate();
                    java.time.LocalDate last = e.toLocalDate();
                    while (!cur.isAfter(last)) {
                        java.time.LocalDateTime dayStart = cur.atStartOfDay();
                        java.time.LocalDateTime dayEnd = dayStart.plusDays(1);
                        java.time.LocalDateTime overlapStart = s.isAfter(dayStart) ? s : dayStart;
                        java.time.LocalDateTime overlapEnd = e.isBefore(dayEnd) ? e : dayEnd;
                        if (overlapEnd.isAfter(overlapStart)) {
                            long minutes = java.time.Duration.between(overlapStart, overlapEnd).toMinutes();
                            double hrs = minutes / 60.0;
                            daily.put(cur, daily.getOrDefault(cur, 0.0) + hrs);
                        }
                        cur = cur.plusDays(1);
                    }
                }

                double total = 0.0;
                for (Double d : daily.values()) {
                    total += Math.min(8.0, d);
                }
                hoursMap.put(uid, (int) Math.floor(total));
            }
        } catch (Exception ex) {
            // fallback: try SQL aggregation
            try {
                java.util.List<Object[]> hrs = eventRegistrationRepository.findHoursSumByUserIds(userIds);
                for (Object[] r : hrs) {
                    Number uid = (Number) r[0];
                    Number h = (Number) r[1];
                    if (uid != null) hoursMap.put(uid.longValue(), h != null ? h.intValue() : 0);
                }
            } catch (Exception ex2) {
                // ignore
            }
        }

        // attach hours to output dtos
        for (com.example.volunteerhub.dto.VolunteerRankDTO dto : out) {
            Long uid = dto.getUserId();
            dto.setHours(hoursMap.getOrDefault(uid, 0));
        }
        return out;
    }
}