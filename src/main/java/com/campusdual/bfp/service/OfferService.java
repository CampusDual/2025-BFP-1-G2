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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private TagDao tagDao;

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
    @Transactional
    public int deleteOffer(int id, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer Offer =OfferDao.getReferenceById(id);
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

    @Override
    public long addTag(String tag) {
        if (tag == null || tag.isEmpty()) {
            throw new RuntimeException("Tag cannot be null or empty");
        }
        if (tagDao.existsTagByName(tag)) {
            throw new RuntimeException("Tag already exists");
        }
        return tagDao.saveAndFlush(new Tag(tag)).getId();
    }

    @Override
    public List<TagDTO> getAllTags() {
        return TagMapper.INSTANCE.toTagDTOs(tagDao.findAll());
    }

    @Override
    public long deleteTag(long tagId) {
        Tag tag = tagDao.findById(tagId).orElseThrow(() -> new RuntimeException("Tag not found"));
        tagDao.delete(tag);
        return tagId;
    }
}