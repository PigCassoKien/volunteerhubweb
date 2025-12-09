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

import java.util.List;

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
        if (authentication == null) return ResponseEntity.status(401).build();
        String email = (authentication.getPrincipal() instanceof UserDetails)
                ? ((UserDetails) authentication.getPrincipal()).getUsername()
                : authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        String endpoint = subscriptionDTO.getEndpoint();
        if (endpoint == null || endpoint.isBlank()) return ResponseEntity.badRequest().build();

        // find all matching endpoints (dedupe)
        List<PushSubscription> matches = subscriptionRepository.findByEndpoint(endpoint);
        if (matches == null || matches.isEmpty()) {
            PushSubscription s = new PushSubscription();
            s.setEndpoint(endpoint);
            s.setPublicKey(subscriptionDTO.getPublicKey() == null ? "" : subscriptionDTO.getPublicKey());
            s.setAuthKey(subscriptionDTO.getAuthKey() == null ? "" : subscriptionDTO.getAuthKey());
            s.setUser(user);
            subscriptionRepository.save(s);
            System.out.println("[PushSub] saved new subscription endpoint=" + endpoint + " user=" + email);
        } else {
            // keep earliest id as canonical, update it and remove duplicates
            matches.sort((a, b) -> a.getId().compareTo(b.getId()));
            PushSubscription canonical = matches.get(0);

            boolean changed = false;
            String incomingPub = subscriptionDTO.getPublicKey() == null ? "" : subscriptionDTO.getPublicKey();
            String incomingAuth = subscriptionDTO.getAuthKey() == null ? "" : subscriptionDTO.getAuthKey();

            if (!incomingPub.equals(canonical.getPublicKey())) {
                canonical.setPublicKey(incomingPub);
                changed = true;
            }
            if (!incomingAuth.equals(canonical.getAuthKey())) {
                canonical.setAuthKey(incomingAuth);
                changed = true;
            }
            if (canonical.getUser() == null || !canonical.getUser().getEmail().equals(email)) {
                canonical.setUser(user);
                changed = true;
            }
            if (changed) {
                subscriptionRepository.save(canonical);
                System.out.println("[PushSub] updated canonical subscription id=" + canonical.getId() + " endpoint=" + endpoint + " user=" + email);
            } else {
                System.out.println("[PushSub] canonical exists id=" + canonical.getId() + " endpoint=" + endpoint + " user=" + email);
            }

            // remove other duplicate rows (if any)
            for (int i = 1; i < matches.size(); i++) {
                PushSubscription dup = matches.get(i);
                try {
                    subscriptionRepository.deleteById(dup.getId());
                    System.out.println("[PushSub] removed duplicate subscription id=" + dup.getId());
                } catch (Exception ex) {
                    System.err.println("[PushSub] failed remove duplicate id=" + dup.getId() + " : " + ex.getMessage());
                }
            }
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PushSubscription>> mySubscriptions(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        String email = (authentication.getPrincipal() instanceof UserDetails)
                ? ((UserDetails) authentication.getPrincipal()).getUsername()
                : authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<PushSubscription> subs = subscriptionRepository.findAllByUserId(user.getId());
        return ResponseEntity.ok(subs);
    }
}
