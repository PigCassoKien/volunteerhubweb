package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findAllByUserId(Long userId);
    List<PushSubscription> findByEndpoint(String endpoint);
    void deleteByEndpoint(String endpoint);
}
