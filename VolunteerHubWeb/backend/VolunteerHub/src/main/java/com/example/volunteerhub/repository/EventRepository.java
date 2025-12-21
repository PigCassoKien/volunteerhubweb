package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByCategoryId(Long categoryId);
    List<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end);
    @Query("SELECT e FROM Event e WHERE e.createdBy.id = :userId")
    List<Event> findByCreatedBy(Long userId);
    List<Event> findByCreatedAtAfter(LocalDateTime createdAt);
    List<Event> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByStatusAndCreatedAtBetween(EventStatus status, LocalDateTime start, LocalDateTime end);

}