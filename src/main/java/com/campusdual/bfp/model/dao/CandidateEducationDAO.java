package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.CandidateEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateEducationDAO extends JpaRepository<CandidateEducation, Long> {
    List<CandidateEducation> findByCandidateId(Long candidateId);
}