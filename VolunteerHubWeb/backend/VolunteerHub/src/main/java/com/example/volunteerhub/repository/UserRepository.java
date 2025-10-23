package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.entity.enums.UserStatus;
import com.example.volunteerhub.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByStatus(UserStatus status);
    Optional<User> findByFullName(String fullName);

    @Query("SELECT u FROM User u WHERE u.role = 'VOLUNTEER' AND (u.email LIKE %:keyword% OR u.fullName LIKE %:keyword%)")
    List<User> searchVolunteersByKeyword(String keyword);
    List<User> findByVerificationStatusAndCreatedAtBefore(VerificationStatus status, LocalDateTime before);

}