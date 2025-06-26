package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.TagDTO;
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
    long addTag(String tag);
    List<TagDTO> getAllTags();

    long deleteTag(long tagId);
}
