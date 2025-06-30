package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.CandidateTags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CandidateTagsDao extends JpaRepository<CandidateTags, Long> {

    List<CandidateTags> findCandidateTagsByCandidate(Candidate candidate);

    void deleteByCandidate(Candidate candidate);

    @Modifying
    @Transactional
    @Query("DELETE FROM CandidateTags ct WHERE ct.candidate.id = :candidateId AND ct.tag.id = :tagId")
    int deleteByCandidateIdAndTagId(@Param("candidateId") int candidateId, @Param("tagId") long tagId);

}