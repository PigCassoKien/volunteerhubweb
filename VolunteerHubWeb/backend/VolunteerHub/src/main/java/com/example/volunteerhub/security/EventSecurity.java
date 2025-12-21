package com.example.volunteerhub.security;

import com.example.volunteerhub.service.EventRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component("eventSecurity")
public class EventSecurity {

    @Autowired
    private EventRegistrationService registrationService;

    public boolean canAccessEvent(Long eventId, Authentication authentication) {
        if (authentication == null || eventId == null) return false;

        for (GrantedAuthority ga : authentication.getAuthorities()) {
            String role = ga.getAuthority();
            if ("ROLE_ADMIN".equals(role) || "ROLE_EVENT_MANAGER".equals(role) || "ROLE_SUPER_ADMIN".equals(role)) {
                return true;
            }
        }

        String email = authentication.getName();
        return registrationService.isUserRegistered(eventId, email); // implement this in EventRegistrationService if missing
    }
}
