package com.example.volunteerhub.service;

import com.example.volunteerhub.entity.OTP;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.OtpType;
import com.example.volunteerhub.entity.enums.UserStatus;
import com.example.volunteerhub.entity.enums.VerificationStatus;
import com.example.volunteerhub.repository.OTPRepository;
import com.example.volunteerhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OTPService {

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    public void generateAndSendOTP(String email, OtpType type) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String code = generateOTP();
        OTP otp = new OTP();
        otp.setUser(userRepository.findByEmail(email).get());
        otp.setCode(code);
        otp.setType(type);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(otp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP code is: " + code + ". It is valid for 10 minutes.");
        mailSender.send(message);
    }

    public boolean verifyOTP(String email, String code, OtpType type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OTP otp = otpRepository.findByUserIdAndCodeAndType(user.getId(), code, type)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        otpRepository.delete(otp);
        return true;
    }

    private String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}