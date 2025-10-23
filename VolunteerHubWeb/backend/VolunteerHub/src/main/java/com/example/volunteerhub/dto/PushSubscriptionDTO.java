package com.example.volunteerhub.dto;

import lombok.Data;

@Data
public class PushSubscriptionDTO {
    private String endpoint;
    private String publicKey;
    private String authKey;
}
