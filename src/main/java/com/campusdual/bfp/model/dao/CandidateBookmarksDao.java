package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.CandidateBookmarks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CandidateBookmarksDao extends JpaRepository<CandidateBookmarks, Integer> {

    @Query("SELECT cb FROM CandidateBookmarks cb WHERE cb.user.id = :userId")
    List<CandidateBookmarks> findByUserId(@Param("userId") int userId);

    @Query("SELECT cb FROM CandidateBookmarks cb WHERE cb.user.id = :userId AND cb.offer.id = :offerId")
    CandidateBookmarks findByUserIdAndOfferId(@Param("userId") int userId, @Param("offerId") int offerId);

    @Query("SELECT COUNT(cb) > 0 FROM CandidateBookmarks cb WHERE cb.user.id = :userId AND cb.offer.id = :offerId")
    boolean existsByUserIdAndOfferId(@Param("userId") int userId, @Param("offerId") int offerId);

    @Query("SELECT cb.offer.id FROM CandidateBookmarks cb WHERE cb.user.id = :userId")
    List<Integer> findOfferIdsByUserId(@Param("userId") int userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CandidateBookmarks cb WHERE cb.user.id = :userId AND cb.offer.id = :offerId")
    void deleteByUserIdAndOfferId(@Param("userId") int userId, @Param("offerId") int offerId);
}