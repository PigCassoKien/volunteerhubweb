package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.OTP;
import com.example.volunteerhub.entity.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByUserIdAndCodeAndType(Long userId, String code, OtpType type);
    List<OTP> findByUserIdAndTypeAndExpiresAtAfter(Long userId, OtpType type, LocalDateTime now);
}