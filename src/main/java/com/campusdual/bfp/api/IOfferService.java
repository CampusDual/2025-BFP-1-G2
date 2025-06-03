package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface IOfferService {
    OfferDTO queryOffer(OfferDTO offerDTO);
    List<OfferDTO> queryAllOffers();
    int insertOffer(OfferDTO offerDTO);
    int updateOffer(OfferDTO offerDTO);
    int deleteOffer(OfferDTO offerDTO);
}
