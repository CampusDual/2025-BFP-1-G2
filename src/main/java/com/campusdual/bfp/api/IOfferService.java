package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface IOfferService {
    OfferDTO queryOffer(OfferDTO request);
    List<OfferDTO> queryAllOffers();
    int insertOffer(OfferDTO request, String username);
    int updateOffer(OfferDTO request, String username);
    int deleteOffer(OfferDTO request, String username);
}
