package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.enums.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByEventId(Long eventId);
    List<Post> findByUserId(Long userId);
    List<Post> findByStatus(PostStatus status);
    List<Post> findByCreatedAtAfter(LocalDateTime createdAt);
    List<Post> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Post> findByEventIdAndStatus(Long eventId, com.example.volunteerhub.entity.enums.PostStatus status);

    int countByEventId(Long eventId);

}