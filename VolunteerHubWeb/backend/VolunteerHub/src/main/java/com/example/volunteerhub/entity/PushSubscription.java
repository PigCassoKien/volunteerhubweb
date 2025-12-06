package com.example.volunteerhub.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PushSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // web push endpoints can be very long -> increase column length
    @Column(nullable = false, length = 2000)
    private String endpoint;

    @Column(nullable = false, length = 5000)
    private String publicKey;

    @Column(nullable = false, length = 5000)
    private String authKey;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
