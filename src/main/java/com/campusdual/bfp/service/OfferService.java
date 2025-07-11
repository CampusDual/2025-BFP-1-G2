package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.exception.*;
import com.campusdual.bfp.model.*;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.*;
import com.campusdual.bfp.model.dto.dtomapper.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OfferService implements IOfferService {

    @Autowired
    private OfferDao offerDao;

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


    private static final int MAX_TAGS_PER_OFFER = 5;

    public OfferDTO buildOfferDTO(Offer offer, boolean includeCompanyInfo) {
        OfferDTO dto = OfferMapper.INSTANCE.toDTO(offer, includeCompanyInfo, offerDao, userDao.findUserById(14));
        dto.setDateAdded(offer.getDate());
        if (includeCompanyInfo && offer.getCompany() != null) {
            Company company = offer.getCompany();
            User user = company.getUser();
            if (user != null) {
                dto.setCompanyName(company.getName());
                dto.setEmail(user.getEmail());
            }
            if (company.getLogo() != null) {
                dto.setLogo(company.getLogo());
            }
        }
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
            throw new TooManyTagsException("Una oferta no puede tener más de " + MAX_TAGS_PER_OFFER + " tags");
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
    public Page<OfferDTO> queryAllOffers(
            String searchTerm,
            List<Long> tagIds,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Offer> offers;
        boolean hasSearch = searchTerm != null && !searchTerm.trim().isEmpty();
        boolean hasTags = tagIds != null && !tagIds.isEmpty();
        if (hasTags && hasSearch) {
            offers = offerDao.findOffersByTagsAndSearchTerm(tagIds, searchTerm, pageable);
        } else if (hasTags) {
            offers = offerDao.findOffersByTags(tagIds, pageable);
        } else if (hasSearch) {
            offers = offerDao.findOffersBySearchTerm(searchTerm, pageable);
        } else {
            offers = offerDao.findOffers(pageable);
        }
        return offers.map(offer -> OfferMapper.INSTANCE.toDTO(offer, false, offerDao, null));
    }

    @Override
    public int insertOffer(OfferDTO request, String username) {
        Offer offer = new Offer();
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setActive(null); // Por defecto, las ofertas se crean como borradores
        offer.setDate(new Date());
        offer.setCompanyId(companyDao.findCompanyByUser(userDao.findByLogin(username)).getId());
        Offer savedOffer = offerDao.saveAndFlush(offer);
        handleOfferTags(savedOffer, request.getTags(), false);

        return savedOffer.getId();
    }

    @Override
    @Transactional
    public int updateOffer(OfferDTO request, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");

        Offer offer = offerDao.getReferenceById(request.getId());
        if (offer.getCompanyId() != companyDao.findCompanyByUser(user).getId()) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar esta oferta");
        }
        int originalCompanyId = offer.getCompanyId();
        BeanUtils.copyProperties(request, offer, "id", "companyId");
        offer.setCompanyId(originalCompanyId);
        handleOfferTags(offer, request.getTags(), true);
        Offer savedOffer = offerDao.saveAndFlush(offer);
        return savedOffer.getId();
    }

    @Override
    @Transactional
    public int deleteOffer(int id, String username) {
        Offer offer = offerDao.getReferenceById(id);
        if (offer.getCompanyId() != companyDao.findCompanyByUser(userDao.findByLogin(username)).getId()) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar esta oferta");
        }
        offerTagsDao.deleteByOfferId(offer.getId());
        userOfferDao.deleteUserOfferByOffer(offer);
        offerDao.delete(offer);
        return id;
    }

    @Override
    public int userApplyOffer(int offerId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");

        Offer offer = offerDao.getReferenceById(offerId);
        if (userOfferDao.existsByUserIdAndOfferId(user.getId(), offer.getId())) {
            throw new DuplicateApplicationException("Ya has aplicado a esta oferta");
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
        List<Offer> offers = offerDao.findOfferByCompanyId(userCompany.getId());
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
            throw new InvalidDataException("Invalid candidate data");
        }

        User user = userDao.findByLogin(candidateDTO.getLogin());
        if (user == null) {
            throw new UserNotFoundException("Usuario no encontrado");
        }

        UserOffer userOffer = userOfferDao.findByUserIdAndOfferId(user.getId(), offerID);
        if (userOffer == null) {
            throw new OfferNotFoundException("No se encontró la oferta para el usuario");
        }

        userOffer.setValid(candidateDTO.getValid());
        userOfferDao.saveAndFlush(userOffer);
    }

    @Override
    public int getCadidateOffersCount(String listType, String name) {
        User user = userDao.findByLogin(name);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        switch (listType) {
            case "bookmarks":
                return offerDao.getBookmarksCount(user.getId());
            case "applied":
                return offerDao.getAppliedOffersCount(user.getId());
            case "recommended":
                return offerDao.getRecommendedOffersCount(user.getId());
            case "all":
                return offerDao.getActiveOffersCount();
            default:
                throw new InvalidListTypeException("Tipo de lista no válido: " + listType);
        }
    }

    @Override
    public Page<OfferDTO> getCandidateOffersPaginated(
            String listType,
            String username,
            String searchTerm,
            List<Long> tagIds,
            int page,
            int size) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Pageable pageable = PageRequest.of(page, size);
        Page<Offer> offers;
        boolean hasSearch = searchTerm != null && !searchTerm.trim().isEmpty();
        boolean hasTags = tagIds != null && !tagIds.isEmpty();
        switch (listType) {
            case "bookmarks":
                if (hasTags && hasSearch) {
                    offers = offerDao.findBookmarkedOffersByUserIdAndTagsAndSearchTerm(user.getId(), tagIds, searchTerm, pageable);
                } else if (hasTags) {
                    offers = offerDao.findBookmarkedOffersByUserIdAndTags(user.getId(), tagIds, pageable);
                } else if (hasSearch) {
                    offers = offerDao.findBookmarkedOffersBySearchTerm(user.getId(), searchTerm, pageable);
                } else {
                    offers = offerDao.findBookmarkedOffersByUserId(user.getId(), pageable);
                }
                break;
            case "applied":
                if (hasTags && hasSearch) {
                    offers = offerDao.findAppliedOffersByUserIdAndTagsAndSearchTerm(user.getId(), tagIds, searchTerm, pageable);
                } else if (hasTags) {
                    offers = offerDao.findAppliedOffersByUserIdAndTags(user.getId(), tagIds, pageable);
                } else if (hasSearch) {
                    offers = offerDao.findAppliedOffersBySearchTerm(user.getId(), searchTerm, pageable);
                } else {
                    offers = offerDao.findAppliedOffersByUserId(user.getId(), pageable);
                }
                break;
            case "recommended":
                if (hasTags && hasSearch) {
                    offers = offerDao.findRecommendedOffersByTagsAndSearchTerm(user.getId(),tagIds, searchTerm, pageable);
                } else if (hasTags) {
                    offers = offerDao.findRecommendedOffersByTags(user.getId(),tagIds, pageable);
                } else if (hasSearch) {
                    offers = offerDao.findOffersByTagsAndSearchTerm(offerDao.findCandidateTagIdsByUserId(user.getId()), searchTerm, pageable);
                } else {
                    offers = offerDao.findOffersByTags(offerDao.findCandidateTagIdsByUserId(user.getId()), pageable);
                }
                break;
            case "all":
                if (hasTags && hasSearch) {
                    offers = offerDao.findOffersByTagsAndSearchTerm(tagIds, searchTerm, pageable);
                } else if (hasTags) {
                    offers = offerDao.findOffersByTags(tagIds, pageable);
                } else if (hasSearch) {
                    offers = offerDao.findOffersBySearchTerm(searchTerm, pageable);
                } else {
                    offers = offerDao.findOffers(pageable);
                }
                break;
            default:
                throw new InvalidListTypeException("Tipo de lista no válido: " + listType);
        }
        return offers.map(offer -> OfferMapper.INSTANCE.toDTO(offer, false, offerDao, user));
    }


    @Override
    public int getCompanyOffersCount(String status, String name) {
        User user = userDao.findByLogin(name);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Company company = companyDao.findCompanyByUser(user);
        if (company == null) throw new CompanyNotFoundException("Empresa no encontrada");
        switch (status) {
            case "active":
                return offerDao.countActiveByCompanyId(company.getId());
            case "draft":
                return offerDao.countDraftByCompanyId(company.getId());
            case "archived":
                return offerDao.countArchivedByCompanyId(company.getId());
            default:
                throw new InvalidListTypeException("Tipo de lista no válido: " + status);
        }
    }

    @Override
    public Page<OfferDTO> getCompanyOffersByStatusPaginated(String username, String status, String searchTerm, List<Long> tagIds, int page, int size) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Company company = companyDao.findCompanyByUser(user);
        if (company == null) throw new CompanyNotFoundException("Empresa no encontrada");
        Pageable pageable = PageRequest.of(page, size);
        Page<Offer> offers;
        boolean hasSearch = searchTerm != null && !searchTerm.trim().isEmpty();
        boolean hasTags = tagIds != null && !tagIds.isEmpty();
        switch (status.toLowerCase()) {
            case "active":
                if (hasTags && hasSearch) {
                    offers = offerDao.findActiveOffersByTagsAndSearchTerm(company.getId(), tagIds, searchTerm, pageable);
                } else if (hasTags) {
                    offers = offerDao.findActiveOffersByTags(company.getId(), tagIds, pageable);
                } else if (hasSearch) {
                    offers = offerDao.findByActiveSearchTerm(company.getId(), searchTerm, pageable);
                } else  {
                    offers = offerDao.findByActive(company.getId(), pageable);
                }
                break;
            case "draft":
                if (hasTags && hasSearch) {
                    offers = offerDao.findDraftOffersByTagsAndSearchTerm(company.getId(), tagIds, searchTerm, pageable);
                } else if (hasTags) {
                    offers = offerDao.findDraftOffersByTags(company.getId(), tagIds, pageable);
                } else if (hasSearch) {
                    offers = offerDao.findByDraftSearchTerm(company.getId(), searchTerm, pageable);
                } else  {
                    offers = offerDao.findByDraft(company.getId(), pageable);
                }
                break;
            case "archived":
                if (hasTags && hasSearch) {
                    offers = offerDao.findArchivedOffersByTagsAndSearchTerm(company.getId(), tagIds, searchTerm, pageable);
                } else if (hasTags) {
                    offers = offerDao.findArchivedOffersByTags(company.getId(), tagIds, pageable);
                } else if (hasSearch) {
                    offers = offerDao.findByArchivedSearchTerm(company.getId(), searchTerm, pageable);
                } else  {
                    offers = offerDao.findByArchived(company.getId(), pageable);
                }
                break;
            default:
                throw new InvalidListTypeException("Tipo de lista no válido: " + status);
        }
        return offers.map(offer -> OfferMapper.INSTANCE.toDTO(offer, true, offerDao, user));
    }

    @Override
    public boolean updateOfferStatus(int offerId, String status, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Company company = companyDao.findCompanyByUser(user);
        if (company == null) throw new CompanyNotFoundException("Empresa no encontrada");
        Offer offer = offerDao.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException("Oferta no encontrada con ID: " + offerId));
        switch (status.toLowerCase()) {
            case "active":
                offer.setActive(true);
                break;
            case "draft":
                offer.setActive(false);
                break;
            case "archived":
                offer.setActive(null);
                break;
            default:
                throw new InvalidListTypeException("Estado no válido: " + status);
        }
        offerDao.saveAndFlush(offer);
        return true;
    }
}