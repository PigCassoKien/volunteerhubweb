package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByUserId(Long userId);
    List<EventRegistration> findByEventId(Long eventId);
    List<EventRegistration> findByStatus(RegistrationStatus status);
    @Query("SELECT r FROM EventRegistration r WHERE r.event.id = :eventId AND r.status = :status")
    List<EventRegistration> findByEventIdAndStatus(Long eventId, RegistrationStatus status);

    @Query("SELECT r FROM EventRegistration r JOIN r.event e WHERE r.user.id = :userId " +
            "AND (:status IS NULL OR r.status = :status) " +
            "AND (:startDate IS NULL OR e.startDate >= :startDate) " +
            "AND (:endDate IS NULL OR e.endDate <= :endDate) " +
            "AND (:categoryId IS NULL OR e.category.id = :categoryId)")
    List<EventRegistration> findEventHistory(Long userId, RegistrationStatus status,
                                             LocalDateTime startDate, LocalDateTime endDate,
                                             Long categoryId);

    int countByEventId(Long eventId);

    int countByEventIdAndStatus(Long eventId, RegistrationStatus registrationStatus);
}