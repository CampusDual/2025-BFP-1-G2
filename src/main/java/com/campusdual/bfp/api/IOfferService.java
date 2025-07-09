package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.data.domain.Page;
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

    List<OfferDTO> getUserBookmarks(String username);

    List<OfferDTO> getCadidateOffers(String listType, String username);

    List<OfferDTO> searchCandidateOffers(String searchTerm, String listType, String username);

    List<OfferDTO> searchOffers(String searchTerm);

    List<OfferDTO> searchCompanyOffers(String searchTerm, Boolean active);

    int getCadidateOffersCount(String listType, String name);

    Page<OfferDTO> getCandidateOffersPaginated(String listType, String username, String searchTerm, int page, int size);
}
