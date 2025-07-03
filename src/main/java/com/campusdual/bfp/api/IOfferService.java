package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface IOfferService {
    OfferDTO queryOffer(OfferDTO request);
    List<OfferDTO> queryAllOffers();
    int insertOffer(OfferDTO request, String username);
    int updateOffer(OfferDTO request, String username);
    int deleteOffer(int request, String username);
    int userApplyOffer(int request, String username);
    List<OfferDTO> getCompanyOffers(String name);
    List<CandidateDTO> getCompanyOffersCandidates(int offerID);
    void updateCandidateValidity(int offerID, CandidateDTO candidateDTO);
    List<OfferDTO> getMyOffers(String username);
    List<OfferDTO> getCompanyOffersByStatus(String companyName, String status);
    void publishOffer(int offerId, String username);
    void archiveOffer(int offerId, String username);
    void draftOffer(int offerId, String username);
}
