package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CandidateDao extends JpaRepository<Candidate, Integer> {
    Candidate findCandidateByUser(User user);

    Candidate findCandidateByUserId(int userId);


    @Query("SELECT MONTH(c.dateAdded) as mes, YEAR(c.dateAdded) as anio, COUNT(c.id) " +
            "FROM Candidate c " +
            "GROUP BY anio, mes " )
    List<Object[]> countRegisteredCandidatesByMonth();
}
