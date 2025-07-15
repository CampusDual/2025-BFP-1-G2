package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.CandidateExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateExperienceDAO {
    List<CandidateExperience> findByCandidateId(Long candidateId);
}
