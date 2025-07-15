package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CandidateDao extends JpaRepository<Candidate, Integer> {
    Candidate findCandidateByUser(User user);

    Candidate findCandidateByUserId(int userId);

    @Query("SELECT u FROM User u WHERE u.id IN (SELECT c.user.id FROM Candidate c)")
    List<User> findAllUsersByCandidate();
}
