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

import java.security.Principal;
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

    @Autowired
    private CompanyDao companyDao;

    @Autowired
    private CandidateBookmarksDao candidateBookmarksDao;


    private static final int MAX_TAGS_PER_OFFER = 5;

    private OfferDTO buildOfferDTO(Offer offer, boolean includeCompanyInfo) {
        OfferDTO dto = OfferMapper.INSTANCE.toDTO(offer);
        dto.setDateAdded(offer.getDate());

        if (includeCompanyInfo && offer.getCompany() != null) {
            Company company = offer.getCompany();
            User user = company.getUser();

            if (user != null) {
                dto.setCompanyName(user.getLogin());
                dto.setEmail(user.getEmail());
            }
            if (company.getLogo() != null) {
                dto.setLogo(company.getLogo());
            }

        }

        // Añadir tags
        List<TagDTO> tagDTOs = getOfferTags(offer.getId());
        dto.setTags(tagDTOs);

        return dto;
    }

    private List<TagDTO> getOfferTags(int offerId) {
        List<OfferTags> offerTags = offerTagsDao.findByOfferId(offerId);
        return offerTags.stream()
                .map(ot -> TagMapper.INSTANCE.toTagDTO(ot.getTag()))
                .collect(Collectors.toList());
    }

    private void handleOfferTags(Offer offer, List<TagDTO> tagDTOs, boolean isUpdate) {
        if (tagDTOs == null) return;

        if (tagDTOs.size() > MAX_TAGS_PER_OFFER) {
            throw new RuntimeException("Una oferta no puede tener más de " + MAX_TAGS_PER_OFFER + " tags");
        }

        if (isUpdate) {
            offerTagsDao.deleteByOfferId(offer.getId());
        }

        for (TagDTO tagDTO : tagDTOs) {
            Tag tag = tagDao.findById(tagDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Tag no encontrado: " + tagDTO.getId()));
            OfferTags offerTag = new OfferTags(offer, tag);
            offerTagsDao.saveAndFlush(offerTag);
        }
    }

    private void sortOffersByDate(List<OfferDTO> offers) {
        offers.sort(Comparator.comparing(OfferDTO::getDateAdded));
        Collections.reverse(offers);
    }

    @Override
    public OfferDTO queryOffer(OfferDTO OfferDTO) {
        Offer Offer = OfferMapper.INSTANCE.toEntity(OfferDTO);
        return OfferMapper.INSTANCE.toDTO(OfferDao.getReferenceById(Offer.getId()));
    }

    @Override
    public List<OfferDTO> queryAllOffers() {
        List<Offer> offers = OfferDao.findAll();
        List<OfferDTO> dtos = offers.stream()
                .map(offer -> buildOfferDTO(offer, true))
                .collect(Collectors.toList());
        sortOffersByDate(dtos);
        return dtos;
    }

    @Override
    public int insertOffer(OfferDTO request, String username) {
        Offer offer = new Offer();
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setActive(null); // Por defecto, las ofertas se crean como borradores
        offer.setDate(new Date());
        offer.setCompanyId(companyDao.findCompanyByUser(userDao.findByLogin(username)).getId());
        Offer savedOffer = OfferDao.saveAndFlush(offer);
        handleOfferTags(savedOffer, request.getTags(), false);

        return savedOffer.getId();
    }

    @Override
    @Transactional
    public int updateOffer(OfferDTO request, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");

        Offer offer = OfferDao.getReferenceById(request.getId());
        if (offer.getCompanyId() != companyDao.findCompanyByUser(user).getId()) {
            throw new RuntimeException("No tienes permiso para modificar esta oferta");
        }

        BeanUtils.copyProperties(request, offer, "id", "companyId");
        handleOfferTags(offer, request.getTags(), true);

        Offer savedOffer = OfferDao.saveAndFlush(offer);
        return savedOffer.getId();
    }

    @Override
    @Transactional
    public int deleteOffer(int id, String username) {
        Offer offer = OfferDao.getReferenceById(id);
        if (offer.getCompanyId() != companyDao.findCompanyByUser(userDao.findByLogin(username)).getId()) {
            throw new RuntimeException("No tienes permiso para modificar esta oferta");
        }
        offerTagsDao.deleteByOfferId(offer.getId());
        userOfferDao.deleteUserOfferByOffer(offer);
        OfferDao.delete(offer);
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
    public List<OfferDTO> getCompanyOffers(String companyName) {
        User userCompany = userDao.findByLogin(companyName);
        List<Offer> offers = OfferDao.findOfferByCompanyId(userCompany.getId());
        List<OfferDTO> dtos = offers.stream()
                .map(offer -> buildOfferDTO(offer, false))
                .collect(Collectors.toList());
        sortOffersByDate(dtos);
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
                    candidateDTO.setValid(userOffer.isValid());
                    candidateDTOS.add(candidateDTO);
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
            throw new RuntimeException("No se encontró la oferta para el usuario");
        }

        userOffer.setValid(candidateDTO.isValid());
        userOfferDao.saveAndFlush(userOffer);
    }

    @Transactional
    @Override
    public List<OfferDTO> getMyOffers(String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");

        List<UserOffer> userOffers = userOfferDao.findOfferByUserId(user.getId());

        return userOffers.stream()
                .map(userOffer -> {
                    Offer offer = OfferDao.getReferenceById(userOffer.getOffer().getId());
                    OfferDTO dto = buildOfferDTO(offer, true);
                    dto.setCandidateValid(userOffer.isValid());
                    dto.setBookmarked(isOfferBookmarked(offer.getId(), username));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private boolean isOfferBookmarked(int offerId, String username) {
        if (username == null) return false;

        User user = userDao.findByLogin(username);
        if (user == null) return false;

        return candidateBookmarksDao.existsByUserIdAndOfferId(user.getId(), offerId);
    }

    @Override
    public List<OfferDTO> getUserBookmarks(String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");

        List<CandidateBookmarks> bookmarks = candidateBookmarksDao.findByUserId(user.getId());

        return bookmarks.stream()
                .map(bookmark -> buildOfferDTO(bookmark.getOffer(), true))
                .collect(Collectors.toList());
    }


}