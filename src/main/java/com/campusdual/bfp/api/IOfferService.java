package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.MonthlyClosedOffersDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface IOfferService {

    Page<OfferDTO> queryAllOffers(String searchTerm, List<Long> tagIds, int page, int size);

    int insertOffer(OfferDTO request, String username);

    int updateOffer(OfferDTO request, String username);

    int deleteOffer(int request, String username);

    int userApplyOffer(int request, String username);

    List<OfferDTO> getCompanyOffers(String name);

    List<CandidateDTO> getCompanyOffersCandidates(int offerID);

    void updateCandidateValidity(int offerID, CandidateDTO candidateDTO);

    int getCadidateOffersCount(String listType, String name);

    Page<OfferDTO> getCandidateOffersPaginated(String listType, String username, String searchTerm, List<Long> tagIds, int page, int size);

    Page<OfferDTO> getCompanyOffersByStatusPaginated(String username, String status, String searchTerm, List<Long> tagIds, int page, int size);

    int getCompanyOffersCount(String status, String name);

    boolean updateOfferStatus(int offerId, String status, String username);

    List<MonthlyClosedOffersDTO> getMonthlyClosedOffersWithAcceptedCandidates();
}
