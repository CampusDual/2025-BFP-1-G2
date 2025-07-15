package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.OfferTags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OfferTagsDao extends JpaRepository<OfferTags, Long> {

    @Query("SELECT ot FROM OfferTags ot WHERE ot.offer.id = :offerId")
    List<OfferTags> findByOfferId(@Param("offerId") int offerId);

    @Query("SELECT COUNT(ot) FROM OfferTags ot WHERE ot.offer.id = :offerId")
    int countByOfferId(@Param("offerId") int offerId);

    @Query("SELECT ot FROM OfferTags ot WHERE ot.offer.id = :offerId AND ot.tag.id = :tagId")
    OfferTags findByOfferIdAndTagId(@Param("offerId") int offerId, @Param("tagId") long tagId);

    @Modifying
    @Transactional
    @Query("DELETE FROM OfferTags ot WHERE ot.offer.id = :offerId AND ot.tag.id = :tagId")
    void deleteByOfferIdAndTagId(@Param("offerId") int offerId, @Param("tagId") long tagId);

    @Modifying
    @Transactional
    @Query("DELETE FROM OfferTags ot WHERE ot.offer.id = :offerId")
    void deleteByOfferId(@Param("offerId") int offerId);

    @Query("SELECT ot.tag.id, ot.tag.name, COUNT(ot.tag.id) AS tagCount " +
            "FROM OfferTags ot " +
            "GROUP BY ot.tag.id, ot.tag.name " +
            "ORDER BY tagCount DESC")
    List<Object[]> findMostFrequentTags();
}