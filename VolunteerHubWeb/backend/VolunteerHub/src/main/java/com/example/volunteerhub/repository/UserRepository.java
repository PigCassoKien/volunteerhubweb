package com.example.volunteerhub.repository;

import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.entity.enums.UserStatus;
import com.example.volunteerhub.entity.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT u FROM User u WHERE u.role = :role AND (lower(u.email) LIKE lower(concat('%', :keyword, '%')) OR lower(u.fullName) LIKE lower(concat('%', :keyword, '%')) OR lower(u.address) LIKE lower(concat('%', :keyword, '%')) OR lower(u.phoneNumber) LIKE lower(concat('%', :keyword, '%'))) ")
    Page<User> searchVolunteers(@Param("keyword") String keyword, @Param("role") UserRole role, Pageable pageable);

    // fallback simple search kept for compatibility
    @Query("SELECT u FROM User u WHERE u.role = 'VOLUNTEER' AND (u.email LIKE %:keyword% OR u.fullName LIKE %:keyword%)")
    List<User> searchVolunteersByKeyword(String keyword);

    List<User> findByVerificationStatusAndCreatedAtBefore(VerificationStatus status, LocalDateTime before);

    long countByRole(UserRole role);

    @Query("SELECT COUNT(DISTINCT u.address) FROM User u WHERE u.role = :role")
    long countDistinctAddressByRole(@Param("role") UserRole role);

}