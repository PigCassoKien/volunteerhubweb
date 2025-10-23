package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.PushSubscriptionDTO;
import com.example.volunteerhub.entity.PushSubscription;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.repository.PushSubscriptionRepository;
import com.example.volunteerhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class PushSubscriptionController {

    @Autowired
    private PushSubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/save")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> saveSubscription(@RequestBody PushSubscriptionDTO subscriptionDTO, Authentication authentication) {
        String email = null;
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = authentication.getName();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PushSubscription subscription = new PushSubscription();
        subscription.setEndpoint(subscriptionDTO.getEndpoint());
        subscription.setPublicKey(subscriptionDTO.getPublicKey());
        subscription.setAuthKey(subscriptionDTO.getAuthKey());
        subscription.setUser(user);

        subscriptionRepository.save(subscription);
        return ResponseEntity.ok().build();
    }
}
