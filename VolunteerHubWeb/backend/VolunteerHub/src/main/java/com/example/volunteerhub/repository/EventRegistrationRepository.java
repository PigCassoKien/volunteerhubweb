package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.EventRegistration;
import com.example.volunteerhub.entity.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT r.user.id as userId, COUNT(r) as registrations FROM EventRegistration r WHERE r.status = :status GROUP BY r.user.id ORDER BY COUNT(r) DESC")
    List<Object[]> findTopVolunteersByRegistrationCount(@Param("status") RegistrationStatus status, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT r.user.id as userId, COUNT(r) as registrations FROM EventRegistration r WHERE r.status IN :statuses GROUP BY r.user.id ORDER BY COUNT(r) DESC")
    List<Object[]> findTopVolunteersByRegistrationCounts(@Param("statuses") java.util.List<RegistrationStatus> statuses, org.springframework.data.domain.Pageable pageable);
    @Query(value = "SELECT r.user_id as userId, COUNT(*) as registrations FROM event_registration r WHERE r.user_id IN (:userIds) GROUP BY r.user_id", nativeQuery = true)
    List<Object[]> findRegistrationCountsByUserIds(@Param("userIds") List<Long> userIds);

    @Query(value = "SELECT r.user_id as userId, SUM(TIMESTAMPDIFF(HOUR, e.start_date, e.end_date)) as hours FROM event_registration r JOIN event e ON r.event_id = e.id WHERE r.user_id IN (:userIds) GROUP BY r.user_id", nativeQuery = true)
    List<Object[]> findHoursSumByUserIds(@Param("userIds") List<Long> userIds);
}