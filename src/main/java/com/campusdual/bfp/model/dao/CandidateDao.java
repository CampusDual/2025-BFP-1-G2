package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT DISTINCT c " +
            "FROM Candidate c " +
            "JOIN UserOffer uo on uo.user = c.user " +
            "WHERE uo.offer.id = ?1 AND uo.offer.active = true")
    Page<Candidate> findAppliedCandidatesFromOffer(Integer offerId, Pageable pageable);

    @Query("SELECT c " +
            "FROM Candidate c " +
            "JOIN CandidateTags ct ON ct.candidate.id = c.id " +
            "JOIN OfferTags ot ON ot.tag.id = ct.tag.id " +
            "JOIN Tag t ON t.id = ct.tag.id " +
            "WHERE ot.offer.id = ?1 AND " +
            "c.user.id NOT IN (SELECT uo.user.id FROM UserOffer uo WHERE uo.offer.id = ?1 AND uo.offer.active = true )" +
            "GROUP BY c.id " +
            "ORDER BY COUNT(ct.tag.id) DESC")
    Page<Candidate> findCandidatesByOfferTags(Integer offerId, Pageable pageable);

    @Query("SELECT t.name " +
            "FROM CandidateTags ct " +
            "JOIN Tag t ON t.id = ct.tag.id " +
            "JOIN OfferTags ot ON ot.tag.id = ct.tag.id " +
            "WHERE ct.candidate.id = ?1 AND ot.offer.id = ?2")
    List<String> findTagsNamesByCandidateIdAndOfferId(Integer candidateId, Integer offerId);

}
