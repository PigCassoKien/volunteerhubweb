package com.example.volunteerhub;

import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class VolunteerHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(VolunteerHubApplication.class, args);
    }

    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminUsername = "Quản Trị Viên Chính";
            String adminPassword = "Admin@123";
            String passwordPattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
            if (!adminPassword.matches(passwordPattern)) {
                throw new RuntimeException("Admin password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.");
            }
            if (userRepository.findByFullName(adminUsername).isEmpty()) {
                User admin = new User();
                admin.setFullName(adminUsername);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setEmail("admin@gmail.com");
                admin.setRole(UserRole.ADMIN);
                admin.setAddress("Default Admin Address");
                admin.setPhoneNumber("0123456789");
                // Set other user attributes as needed, e.g. phone, address, etc.
                userRepository.save(admin);
            }
        };
    }
}
