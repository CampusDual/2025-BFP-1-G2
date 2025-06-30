package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.*;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.TagDTO;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import com.campusdual.bfp.model.dto.dtomapper.TagMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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

    @Autowired
    private TagDao tagDao;

    @Autowired
    private OfferTagsDao offerTagsDao;

    private static final int MAX_TAGS_PER_OFFER = 5;

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
            List<OfferTags> offerTags = offerTagsDao.findByOfferId(offer.getId());
            List<TagDTO> tagDTOs = offerTags.stream()
                    .map(ot -> TagMapper.INSTANCE.toTagDTO(ot.getTag()))
                    .collect(Collectors.toList());
            dto.setTags(tagDTOs);
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
        if (request.getTags() != null && request.getTags().size() > MAX_TAGS_PER_OFFER) {
            throw new RuntimeException("Una oferta no puede tener más de " + MAX_TAGS_PER_OFFER + " tags");
        }
        if (request.getTags() != null) {
            for (TagDTO tagDTO : request.getTags()) {
                Tag tag = tagDao.findById(tagDTO.getId())
                        .orElseThrow(() -> new RuntimeException("Tag no encontrado: " + tagDTO.getId()));
                OfferTags offerTag = new OfferTags(offer, tag);
                offerTagsDao.saveAndFlush(offerTag);
            }
        }
        Offer savedOffer = OfferDao.saveAndFlush(offer);
        return savedOffer.getId();
    }

    @Override
    @Transactional
    public int updateOffer(OfferDTO request, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer offer = OfferDao.getReferenceById(request.getId());
        if (offer.getCompanyId() != user.getId()) {
            throw new RuntimeException("No tienes permiso para modificar esta oferta");
        }
        if (request.getTags() != null && request.getTags().size() > MAX_TAGS_PER_OFFER) {
            throw new RuntimeException("Una oferta no puede tener más de " + MAX_TAGS_PER_OFFER + " tags");
        }
        BeanUtils.copyProperties(request, offer, "id", "companyId");
        if (request.getTags() != null) {
            offerTagsDao.deleteByOfferId(offer.getId());
            for (TagDTO tagDTO : request.getTags()) {
                Tag tag = tagDao.findById(tagDTO.getId())
                        .orElseThrow(() -> new RuntimeException("Tag no encontrado: " + tagDTO.getId()));
                OfferTags offerTag = new OfferTags(offer, tag);
                offerTagsDao.saveAndFlush(offerTag);
            }
        }
        Offer savedOffer = OfferDao.saveAndFlush(offer);
        return savedOffer.getId();
    }

    @Override
    @Transactional
    public int deleteOffer(int id, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer Offer =OfferDao.getReferenceById(id);
        offerTagsDao.deleteByOfferId(Offer.getId());
        userOfferDao.deleteUserOfferByOffer(Offer);
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
            List<OfferTags> offerTags = offerTagsDao.findByOfferId(offer.getId());
            List<TagDTO> tagDTOs = offerTags.stream()
                    .map(ot -> TagMapper.INSTANCE.toTagDTO(ot.getTag()))
                    .collect(Collectors.toList());
            dto.setTags(tagDTOs);
            dtos.add(dto);
        }
        dtos.sort(Comparator.comparing(OfferDTO::getDateAdded));
        Collections.reverse(dtos);
        return dtos;
    }
    @Override
    public List<CandidateDTO> getCompanyOffersCandidates(int offerID) {
        List<Integer> userIds = userOfferDao.findUserIdsByOfferId(offerID);
        List<CandidateDTO> candidateDTOS = new ArrayList<>();
        for (Integer userId : userIds) {
            User user = userDao.findUserById(userId);
            if (user != null) {
                Candidate candidate = candidateDao.findCandidateByUser(user);
                if (candidate != null) {
                    UserOffer userOffer = userOfferDao.findByUserIdAndOfferId(userId, offerID);
                    CandidateDTO candidateDTO = CandidateMapper.INSTANCE.toDTO(candidate);
                    candidateDTO.setDateAdded(new java.text.SimpleDateFormat("dd/MM/yyyy").format(userOffer.getDate()));
                    candidateDTOS.add(candidateDTO);
                    Boolean valid = userOffer.isValid();
                    candidateDTOS.get(candidateDTOS.size() - 1).setValid(valid);
                }
            }
        }
        return candidateDTOS;
    }

    @Override
    public void updateCandidateValidity(int offerID, CandidateDTO candidateDTO) {
        if (candidateDTO == null || candidateDTO.getLogin() == null) {
            throw new RuntimeException("Invalid candidate data");
        }
        User user = userDao.findByLogin(candidateDTO.getLogin());
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado");
        }
        UserOffer userOffer = userOfferDao.findByUserIdAndOfferId(user.getId(), offerID);
        if (userOffer == null) {
            System.out.println("No se encontró la oferta para el usuario: " + user.getLogin());
            System.out.println("offerID: " + offerID + ", userId: " + user.getId());
            throw new RuntimeException("No se encontró la oferta para el usuario");
        }
        userOffer.setValid(candidateDTO.isValid());
        userOfferDao.saveAndFlush(userOffer);
    }


}