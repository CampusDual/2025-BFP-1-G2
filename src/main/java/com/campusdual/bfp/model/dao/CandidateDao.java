package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Objects;

public interface CandidateDao extends JpaRepository<Candidate, Integer> {
    Candidate findCandidateByUser(User user);

    Candidate findCandidateByUserId(int userId);

    @Query("SELECT u.id, c.dateAdded  FROM User u join  Candidate c on u.id = c.user.id")
    List<Object[]> findAllUsersByCandidate();
}
