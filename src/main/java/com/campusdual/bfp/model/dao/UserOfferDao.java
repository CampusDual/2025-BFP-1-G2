package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.UserOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserOfferDao extends JpaRepository<UserOffer, Long> {
    boolean existsByUserIdAndOfferId(int userId, int offerId);
    int countByOfferId(int offerId);
    @Query("SELECT uo.user.id FROM UserOffer uo WHERE uo.offer.id = :offerId")
    List<Integer> findUserIdsByOfferId(@Param("offerId") int offerId);
    UserOffer findByUserIdAndOfferId(int userId, int offerId);
    void deleteUserOfferByOffer(Offer offer);
}
