package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.UserOffer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserOfferDao extends JpaRepository<UserOffer, Long> {


    boolean findByUserIdAndOfferId(int id, int id1);

}
