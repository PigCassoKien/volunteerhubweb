package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/toggle/{eventId}")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@PathVariable Long eventId, Authentication authentication) {
        String email = authentication.getName();
        boolean favorited = favoriteService.toggleFavorite(eventId, email);
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }

    @GetMapping("/my")
    public ResponseEntity<List<EventDTO>> myFavorites(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(favoriteService.getMyFavorites(email));
    }

    @GetMapping("/check/{eventId}")
    public ResponseEntity<Map<String, Object>> checkFavorited(@PathVariable Long eventId, Authentication authentication) {
        String email = authentication.getName();
        boolean favorited = favoriteService.isFavorited(eventId, email);
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }
}