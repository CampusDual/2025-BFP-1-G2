package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.*;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

public interface OfferDao extends JpaRepository<Offer, Integer> {


    @Query("SELECT MONTH(o.dateAdded) as mes, YEAR(o.dateAdded) as anio, COUNT(o.id) " +
            "FROM Offer o " +
            "WHERE o.active = true"+
            " GROUP BY mes, anio " )
    List<Object[]>countActiveOffersByMonth();

    @Query("SELECT o FROM Offer o WHERE o.company.id = :companyId")
    List<Offer> findOfferByCompanyId(@Param("companyId") int companyId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Offer o WHERE o.company.id = :companyId")
    int deleteAllByCompanyId(@Param("companyId") int companyId);

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
    Integer getBookmarksCount(int userId);

    @Query("SELECT o FROM Offer o WHERE o.active = true ORDER BY o.dateAdded DESC")
    Page<Offer> findOffers(Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND " +
            "o.active = true " +
            "ORDER BY uo.date DESC")
    Page<Offer> findAppliedOffersByUserId(@Param("userId") int userId, Pageable pageable);

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

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findOffersByTags(@Param("tagIds") List<Long> tagIds, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND ot.tag.id IN :tagIds AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findOffersByTagsAndSearchTerm(@Param("tagIds") List<Long> tagIds, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND o.active = true AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findAppliedOffersBySearchTerm(int userId, @Param("searchTerm") String searchTerm, Pageable pageable);


    @Query("SELECT COUNT(o) FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Integer getRecommendedOffersCount(List<Long> tagIds);

    @Query("SELECT DISTINCT ot.tag.id FROM OfferTags ot " +
            "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
            "JOIN Candidate c ON c.id = ct.candidate.id " +
            "WHERE c.user.id = :userId")
    List<Long> findCandidateTagIdsByUserId(int userId);

    @Query("SELECT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND o.active = true AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findAppliedOffersByUserIdAndTags(int userId, @Param("tagIds") List<Long> tagIds, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN UserOffer uo ON uo.offer.id = o.id " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE uo.user.id = :userId AND o.active = true AND ot.tag.id IN :tagIds AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findAppliedOffersByUserIdAndTagsAndSearchTerm(int userId, @Param("tagIds") List<Long> tagIds, @Param("searchTerm") String searchTerm, Pageable pageable);


    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND o IN  (" +
                "SELECT DISTINCT o FROM Offer o " +
                "JOIN OfferTags ot ON ot.offer.id = o.id " +
                "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
                "JOIN Candidate c ON c.id = ct.candidate.id " +
                "WHERE c.user.id = :userId AND " +
                "o.active = true " +
                "GROUP BY o.id )" +
            "AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id) DESC")
    Page<Offer> findRecommendedOffersByTags(int userId, @Param("tagIds") List<Long> tagIds ,Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND o IN  (" +
                "SELECT DISTINCT o FROM Offer o " +
                "JOIN OfferTags ot ON ot.offer.id = o.id " +
                "JOIN CandidateTags ct ON ct.tag.id = ot.tag.id " +
                "JOIN Candidate c ON c.id = ct.candidate.id " +
                "WHERE c.user.id = :userId AND " +
                "o.active = true " +
                "GROUP BY o.id )" +
            "AND ot.tag.id IN :tagIds AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id) DESC")
    Page<Offer> findRecommendedOffersByTagsAndSearchTerm(int userId, @Param("tagIds") List<Long> tagIds, @Param("searchTerm") String searchTerm, Pageable pageable);


    @Query("SELECT o FROM Offer o " +
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND o.active = true AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findBookmarkedOffersByUserIdAndTags(int userId, @Param("tagIds") List<Long> tagIds, Pageable pageable);


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
            "JOIN CandidateBookmarks cb ON cb.offer.id = o.id " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE cb.user.id = :userId AND o.active = true AND ot.tag.id IN :tagIds AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findBookmarkedOffersByUserIdAndTagsAndSearchTerm(int userId, @Param("tagIds") List<Long> tagIds, @Param("searchTerm") String searchTerm, Pageable pageable);

    // Métodos para buscar ofertas activas, borradores y archivadas para compañias

    @Query("SELECT o FROM Offer o WHERE o.active = true AND o.company.id = :companyId "+
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByActive(@Param("companyId") int companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.active = false AND o.company.id = :companyId " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByArchived(@Param("companyId") int companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE o.active = null AND o.company.id = :companyId")
    Page<Offer> findByDraft(@Param("companyId") int companyId, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = true AND o.company.id = :companyId AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByActiveSearchTerm(@Param("companyId") int companyId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = false AND o.company.id = :companyId AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByArchivedSearchTerm(@Param("companyId") int companyId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT o FROM Offer o WHERE " +
            "o.active = null AND o.company.id = :companyId AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY o.dateAdded DESC")
    Page<Offer> findByDraftSearchTerm(@Param("companyId") int companyId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId AND o.active = true")
    Integer countActiveByCompanyId(@Param("companyId") int companyId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId AND o.active = false")
    Integer countArchivedByCompanyId(@Param("companyId") int companyId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId AND o.active IS NULL")
    Integer countDraftByCompanyId(@Param("companyId") int companyId);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND o.company.id = :companyId AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findActiveOffersByTags(@Param("companyId") int companyId, @Param("tagIds") List<Long> tagIds, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active is NULL AND o.company.id = :companyId AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findDraftOffersByTags(@Param("companyId") int companyId, @Param("tagIds") List<Long> tagIds, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = false AND o.company.id = :companyId AND ot.tag.id IN :tagIds " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findArchivedOffersByTags(@Param("companyId") int companyId, @Param("tagIds") List<Long> tagIds, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = true AND o.company.id = :companyId AND ot.tag.id IN :tagIds AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findActiveOffersByTagsAndSearchTerm(@Param("companyId") int companyId, @Param("tagIds") List<Long> tagIds, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active IS NULL AND o.company.id = :companyId AND ot.tag.id IN :tagIds AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findDraftOffersByTagsAndSearchTerm(@Param("companyId") int companyId, @Param("tagIds") List<Long> tagIds, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN OfferTags ot ON ot.offer.id = o.id " +
            "WHERE o.active = false AND o.company.id = :companyId AND ot.tag.id IN :tagIds AND (" +
            "LOWER(o.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.company.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))" +
            "GROUP BY o.id " +
            "ORDER BY COUNT(ot.tag.id)  DESC")
    Page<Offer> findArchivedOffersByTagsAndSearchTerm(@Param("companyId") int companyId, @Param("tagIds") List<Long> tagIds, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT o.id, o.dateAdded, MIN(uo.validationDate) " +
            "FROM Offer o LEFT JOIN UserOffer uo ON uo.offer.id = o.id " +
            "WHERE o.company.id = :companyId AND o.active = true " +
            "AND (uo.valid = true OR uo.id IS NULL) " +
            "GROUP BY o.id, o.dateAdded")
    List<Object[]> findOfferCreationAndFirstHireDateByCompanyId(@Param("companyId") int companyId);
}
