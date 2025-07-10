package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.*;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
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
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
            "JOIN Candidate c ON c.id = ct.candidate.id " +
            "WHERE c.user.id = :userId AND " +
            "o.active = true ")
    Integer getRecommendedOffersCount(int userId);

    @Query("SELECT COUNT(o) FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND " +
            "o.active = true")
    Integer getBookmarksCount(int userId);

    @Query("SELECT o FROM Offer o WHERE o.active = true ORDER BY o.dateAdded DESC")
    Page<Offer> findActiveOffers(Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND " +
            "o.active = true " +
            "ORDER BY uo.date DESC")
    Page<Offer> findAppliedOffersByUserId(@Param("userId") int userId, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
            "JOIN Candidate c ON c.id = ct.candidate.id " +
            "WHERE c.user.id = :userId AND " +
            "o.active = true " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id) DESC")
    Page<Offer> findRecommendedOffersByUserId(@Param("userId") int userId, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND " +
            "o.active = true " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findBookmarkedOffersByUserId(@Param("userId") int userId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findOffersBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);


    @Query("SELECT o FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND " +
            "o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findBookmarkedOffersBySearchTerm(@Param("userId") int userId, @Param("searchTerm") String searchTerm, Pageable pageable);


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
    Page<Offer> findRecommendedOffersByAndSearchTerm(@Param("userId") int userId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND " +
            "o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY uo.date DESC")
    Page<Offer> findAppliedOffersByAndSearchTerm(@Param("userId") int userId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT o.company FROM Offer o WHERE o.id = :offerId")
    Company findCompanyByOfferId(int offerId);

    @Query("SELECT c FROM Candidate c " +
            "JOIN UserOffer uo ON uo.offer.id = :offerId " +
            "WHERE uo.user.id = c.user.id")
    List<Candidate> findCandidatesByOfferId(int offerId);

    @Query("SELECT t FROM Tag t " +
            "JOIN OfferTags ot ON ot.tag.id = t.id " +
            "WHERE ot.offer.id = :offerId")
    List<Tag> findTagsByOfferId(int offerId);

    @Query("SELECT COUNT(cb) > 0 FROM CandidateBookmarks cb " +
            "WHERE cb.user.id = :userId AND cb.offer.id = :offerId")
    boolean isOfferBookmarkedByUserIdAndOfferId(int userId, int offerId);

    @Query("SELECT o FROM Offer o WHERE o.company.id = :companyId "+
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByCompanyId(int companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.active = true AND o.company.id = :companyId "+
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByActive(int companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.active = false AND o.company.id = :companyId " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByArchived(int companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.active = null AND o.company.id = :companyId")
    Page<Offer> findByDraft(int companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = true AND o.company.id = :companyId AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByActiveSearchTerm(int companyId, String searchTerm, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = false AND o.company.id = :companyId AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByArchivedSearchTerm(int companyId, String searchTerm, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = null AND o.company.id = :companyId AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByDraftSearchTerm(int companyId, String searchTerm, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId AND o.active = true")
    Integer countActiveByCompanyId(int companyId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId AND o.active = false")
    Integer countArchivedByCompanyId(int companyId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId AND o.active IS NULL")
    Integer countDraftByCompanyId(int companyId);

    @Query("SELECT DISTINCT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND ot.tag.id IN :tagIds " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findActiveOffersByTags(@Param("tagIds") List<Integer> tagIds, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND o.active = true AND ot.tag.id IN :tagIds " +
            "ORDER BY uo.date DESC")
    Page<Offer> findAppliedOffersByUserIdAndTags(@Param("userId") int userId, @Param("tagIds") List<Integer> tagIds, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
            "JOIN Candidate c ON c.id = ct.candidate.id " +
            "WHERE c.user.id = :userId AND o.active = true AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id) DESC")
    Page<Offer> findRecommendedOffersByUserIdAndTags(@Param("userId") int userId, @Param("tagIds") List<Integer> tagIds, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND o.active = true AND ot.tag.id IN :tagIds " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findBookmarkedOffersByUserIdAndTags(@Param("userId") int userId, @Param("tagIds") List<Integer> tagIds, Pageable pageable);

    //findDraftOffersByTags
    @Query("SELECT DISTINCT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active IS NULL AND ot.tag.id IN :tagIds " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findDraftOffersByTags(@Param("tagIds") List<Integer> tagIds, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = false AND ot.tag.id IN :tagIds " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findArchivedOffersByTags(@Param("tagIds") List<Integer> tagIds, Pageable pageable);
}
