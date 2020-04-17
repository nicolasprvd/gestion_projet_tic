package com.app.projettic.repository;

import com.app.projettic.domain.UserExtra;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data  repository for the UserExtra entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserExtraRepository extends JpaRepository<UserExtra, Long> {
    List<UserExtra> findAll();
    List<UserExtra> findByGroupeId(Long groupeId);
    List<UserExtra> findByActif(boolean actif);
}
