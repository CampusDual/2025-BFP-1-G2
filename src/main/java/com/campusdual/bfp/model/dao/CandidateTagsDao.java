package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.CandidateTags;
import com.campusdual.bfp.model.OfferTags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CandidateTagsDao extends JpaRepository<CandidateTags, Long> {

    @Query("SELECT ct FROM CandidateTags ct WHERE ct.candidate.id = : candidateTags")
    List<CandidateTags> findByOfferId(@Param("candidateId") int candidateId);

    @Query("SELECT COUNT(ct) FROM CandidateTags ct WHERE ct.candidate.id= :candidateId")
    int countByOfferId(@Param("candidateId") int candidateId);

    @Query("SELECT ct FROM CandidateTags ct WHERE ct.candidate.id = :candidateId AND ct.tag.id = :tagId")
    CandidateTags findByCandidateIdAndTagId(@Param("candidateId") int candidateId, @Param("tagId") long tagId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CandidateTags ct WHERE ct.candidate.id = :candidateId AND ct.tag.id = :tagId")
    void deleteByCandidateIdAndTagId(@Param("candidateId") int candidateId, @Param("tagId") long tagId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CandidateTags ct WHERE ct.candidate.id = :candidateId")
    void deleteByOfferId(@Param("candidateId") int candidateId);
}