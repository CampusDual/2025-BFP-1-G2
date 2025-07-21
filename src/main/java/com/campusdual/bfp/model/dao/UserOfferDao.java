package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.UserOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface UserOfferDao extends JpaRepository<UserOffer, Long> {
    boolean existsByUserIdAndOfferId(int userId, int offerId);
    int countByOfferId(int offerId);
    @Query("SELECT uo.user.id FROM UserOffer uo WHERE uo.offer.id = :offerId")
    List<Integer> findUserIdsByOfferId(@Param("offerId") int offerId);
    UserOffer findByUserIdAndOfferId(int userId, int offerId);
    void deleteUserOfferByOffer(Offer offer);

    @Query("SELECT uo.date FROM UserOffer uo WHERE uo.user.id = :userId")
    List<Date> findDatesByUserId(@Param("userId") int userId);

    List<UserOffer> findUserOffersByOfferId(int offerId);

    @Query("SELECT MONTH(uo.validationDate) as mes, YEAR(uo.validationDate) as anio, COUNT(uo.id) " +
            "FROM UserOffer uo " +
            "WHERE uo.valid = true AND uo.validationDate IS NOT NULL " +
            "GROUP BY anio, mes ")
    List<Object[]> countAcceptedCandidatesByMonth();
}
