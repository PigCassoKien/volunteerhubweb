package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.EventDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Favorite;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.FavoriteRepository;
import com.example.volunteerhub.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ModelMapper modelMapper;

    public boolean toggleFavorite(Long eventId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        return favoriteRepository.findByUserIdAndEventId(user.getId(), eventId)
                .map(fav -> {
                    favoriteRepository.delete(fav);
                    return false;
                })
                .orElseGet(() -> {
                    Favorite fav = new Favorite();
                    fav.setUser(user);
                    fav.setEvent(event);
                    fav.setCreatedAt(LocalDateTime.now());
                    favoriteRepository.save(fav);
                    return true;
                });
    }

    public List<EventDTO> getMyFavorites(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<Favorite> list = favoriteRepository.findByUserId(user.getId());
        return list.stream()
                .map(f -> {
                    Event e = f.getEvent();
                    EventDTO dto = modelMapper.map(e, EventDTO.class);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public boolean isFavorited(Long eventId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return favoriteRepository.findByUserIdAndEventId(user.getId(), eventId).isPresent();
    }
}