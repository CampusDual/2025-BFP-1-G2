package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.UserOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserOfferDao extends JpaRepository<UserOffer, Long> {
    boolean existsByUserIdAndOfferId(int userId, int offerId);
    int countByOfferId(int offerId);
    List<Integer> findUserIdsByOfferId(int offerId);
}
