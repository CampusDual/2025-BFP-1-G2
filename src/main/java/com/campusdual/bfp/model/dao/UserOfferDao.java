package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.UserOffer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserOfferDao extends JpaRepository<UserOffer, Long> {
    UserOffer findByUserAndOffer(User user, Offer offer);
    void deleteByUserAndOffer(User user, Offer offer);

}
