package com.example.volunteerhub.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PushSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String endpoint;

    @Column(nullable = false, length = 5000)
    private String publicKey;

    @Column(nullable = false, length = 5000)
    private String authKey;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
