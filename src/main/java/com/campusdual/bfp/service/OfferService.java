package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.UserOffer;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dao.UserOfferDao;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class OfferService implements IOfferService {

    @Autowired
    private OfferDao OfferDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private UserOfferDao userOfferDao;

    @Autowired
    private CandidateDao candidateDao;

    @Override
    public OfferDTO queryOffer(OfferDTO OfferDTO) {
        Offer Offer = OfferMapper.INSTANCE.toEntity(OfferDTO);
        return OfferMapper.INSTANCE.toDTO(OfferDao.getReferenceById(Offer.getId()));
    }

    @Override
    public List<OfferDTO> queryAllOffers() {
        List<Offer> offers = OfferDao.findAll();
        List<OfferDTO> dtos = new ArrayList<>();
        for (Offer offer : offers) {
            OfferDTO dto = OfferMapper.INSTANCE.toDTO(offer);
            User user = userDao.findUserById(offer.getCompanyId());
            if (user != null) {
                dto.setCompanyName(user.getLogin());
                dto.setEmail(user.getEmail());
            }
            dto.setDateAdded(offer.getDate());
            dtos.add(dto);
        }
        dtos.sort(Comparator.comparing(OfferDTO::getDateAdded));
        Collections.reverse(dtos);
        return dtos;
    }

    @Override
    public int insertOffer(OfferDTO request, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer offer = new Offer();
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setActive(true);
        offer.setDate(new Date());
        offer.setCompanyId(user.getId());
        Offer savedOffer = OfferDao.saveAndFlush(offer);
        return savedOffer.getId();
    }

    @Override
    public int updateOffer(OfferDTO request, String username) {
        return insertOffer(request, username);
    }

    @Override
    public int deleteOffer(OfferDTO OfferDTO, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        int id = OfferDTO.getId();
        Offer Offer = OfferMapper.INSTANCE.toEntity(OfferDTO);
        OfferDao.delete(Offer);
        return id;
    }

    @Override
    public int userApplyOffer(int offerId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer offer = OfferDao.getReferenceById(offerId);
        if (userOfferDao.existsByUserIdAndOfferId(user.getId(), offer.getId())) {
            throw new RuntimeException("Ya has aplicado a esta oferta");
        }
        UserOffer userOffer = new UserOffer();
        userOffer.setUser(user);
        userOffer.setOffer(offer);
        userOffer.setDate(new Date());
        userOfferDao.saveAndFlush(userOffer);
        return offer.getId();
    }

    @Override
    public List<OfferDTO> getCompanyOffers(String companyName){
        User userCompany = userDao.findByLogin(companyName);
        int companyId = userCompany.getId();
        List<Offer> offers = OfferDao.findOfferByCompanyId(companyId);
        List<OfferDTO> dtos = new ArrayList<>();
        for (Offer offer : offers) {
            OfferDTO dto = OfferMapper.INSTANCE.toDTO(offer);
            dto.setCompanyName("");
            dto.setEmail("");
            dto.setDateAdded(offer.getDate());
            dtos.add(dto);
        }
        dtos.sort(Comparator.comparing(OfferDTO::getDateAdded));
        Collections.reverse(dtos);
        return dtos;
    }
    @Override
    public List<CandidateDTO> getCompanyOffersCandidates(int offerID) {
        List<Integer> userIds = userOfferDao.findUserIdsByOfferId(offerID);
        List<Candidate> candidates = new ArrayList<>();
        for (Integer userId : userIds) {
            User user = userDao.findUserById(userId);
            if (user != null) {
                Candidate candidate = candidateDao.findCandidateByUser(user);
                if (candidate != null) {
                    candidates.add(candidate);
                }
            }
        }
        return CandidateMapper.INSTANCE.toDTOList(candidates);
    }
}