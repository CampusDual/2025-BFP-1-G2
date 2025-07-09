package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.UserOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OfferDao extends JpaRepository<Offer, Integer> {

    // Buscar ofertas por ID de empresa (relación directa)
    @Query("SELECT o FROM Offer o WHERE o.company.id = :companyId")
    List<Offer> findOfferByCompanyId(@Param("companyId") int companyId);

    @Query("DELETE FROM Offer o WHERE o.company.id = :companyId")
    int deleteAllByCompanyId(@Param("companyId") int companyId);

    @Query("SELECT o FROM Offer o WHERE o.company.id = :companyId AND " +
            "((:status = 'draft' AND o.active IS NULL) OR " +
            "(:status = 'active' AND o.active = true) OR " +
            "(:status = 'archived' AND o.active = false))")
    List<Offer> findOffersByCompanyIdAndStatus(@Param("companyId") int companyId, @Param("status") String status);

    @Query("SELECT o FROM Offer o WHERE o.active = true ")
    List<Offer> findActiveOffers();

    @Query("SELECT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND " +
            "o.active = true " +
            "ORDER BY uo.date DESC")
    List<Offer> findAppliedOffersByUserId(@Param("userId") int userId);

    @Query("SELECT COUNT(uo) > 0 FROM UserOffer uo " +
            "WHERE uo.user.id = :userId AND uo.offer.id = :offerId")
    boolean isOfferAppliedByUserIdAndOfferId(int userId, int offerId);

    @Query("SELECT uo.valid FROM UserOffer uo " +
            "WHERE uo.user.id = :userId AND uo.offer.id = :offerId")
    Optional<Boolean> getAppliedByUserIdAndOfferId(int userId, int offerId);

    @Query("SELECT COUNT(o) FROM Offer o " +
            "WHERE o.active = true ")
    Integer getActiveOffersCount();

    @Query("SELECT COUNT(o) FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND " +
            "o.active = true")
    Integer getAppliedOffersCount(@Param("userId") int userId);

    @Query("SELECT COUNT(o) FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND " +
            "o.active = true")
    Integer getRecommendedOffersCount(int userId);

    @Query("SELECT COUNT(o) FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND " +
            "o.active = true")
    Integer getBookmarksCount(int userId);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
            "JOIN Candidate c ON c.id = ct.candidate.id " +
            "WHERE c.user.id = :userId AND " +
            "o.active = true " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id) DESC")
    List<Offer> findRecommendedOffersByUserId(@Param("userId") int userId);

    @Query("SELECT o FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND " +
            "o.active = true " +
            "ORDER BY o.dateAdded DESC")
    List<Offer> findBookmarkedOffersByUserId(@Param("userId") int userId);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    List<Offer> findOffersBySearchTerm(@Param("searchTerm") String searchTerm);

    @Query("SELECT o FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND " +
            "o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    List<Offer> findBookmarkedOffersBySearchTerm(@Param("userId") int userId, @Param("searchTerm") String searchTerm);


    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
            "JOIN Candidate c ON c.id = ct.candidate.id " +
            "WHERE c.user.id = :userId AND " +
            "o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id) DESC")
    List<Offer> findRecommendedOffersByAndSearchTerm(@Param("userId") int userId, @Param("searchTerm") String searchTerm);

    @Query("SELECT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND " +
            "o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY uo.date DESC")
    List<Offer> findAppliedOffersByAndSearchTerm(@Param("userId") int userId, @Param("searchTerm") String searchTerm);


}
