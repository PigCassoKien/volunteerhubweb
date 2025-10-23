package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByPostId(Long postId);
    List<Reaction> findByCommentId(Long commentId);
    List<Reaction> findByUserId(Long userId);

    int countByPostId(Long eventId);
}