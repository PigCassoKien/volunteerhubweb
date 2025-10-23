package com.example.volunteerhub.entity;

import com.example.volunteerhub.entity.enums.OtpType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String code;

    @Enumerated(EnumType.STRING)
    private OtpType type;

    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
