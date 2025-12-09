package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findAllByUserId(Long userId);
    // return all matches so controller can dedupe if DB contains duplicates
    List<PushSubscription> findByEndpoint(String endpoint);
    void deleteByEndpoint(String endpoint);
}
