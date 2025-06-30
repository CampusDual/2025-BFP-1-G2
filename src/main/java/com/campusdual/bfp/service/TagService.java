package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ITagService;
import com.campusdual.bfp.model.*;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.TagDTO;
import com.campusdual.bfp.model.dto.dtomapper.TagMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagService implements ITagService {

    @Autowired
    private OfferDao OfferDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TagDao tagDao;

    @Autowired
    private OfferTagsDao offerTagsDao;

    @Autowired
    private CandidateTagsDao candidateTagsDao;

    private static final int MAX_TAGS_PER_OFFER = 5;
    @Autowired
    private CandidateDao candidateDao;

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

    @Override
    public long updateTag(long id, String name){
        Tag tag = tagDao.findById(id).orElseThrow(() -> new RuntimeException("Tag not found"));
        if (name == null || name.isEmpty()) {
            throw new RuntimeException("Tag name cannot be null or empty");
        }
        tag.setName(name);
        tagDao.saveAndFlush(tag);
        return tag.getId();
    }

    @Override
    @Transactional
    public int addTagsToOffer(int offerId, List<Long> tagIds, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");

        Offer offer = OfferDao.getReferenceById(offerId);
        if (offer.getCompanyId() != user.getId()) {
            throw new RuntimeException("No tienes permiso para modificar esta oferta");
        }

        int currentTagCount = offerTagsDao.countByOfferId(offerId);
        if (currentTagCount + tagIds.size() > MAX_TAGS_PER_OFFER) {
            throw new RuntimeException("Una oferta no puede tener más de " + MAX_TAGS_PER_OFFER + " tags");
        }

        for (Long tagId : tagIds) {
            Tag tag = tagDao.findById(tagId)
                    .orElseThrow(() -> new RuntimeException("Tag no encontrado: " + tagId));
            OfferTags existingOfferTag = offerTagsDao.findByOfferIdAndTagId(offerId, tagId);
            if (existingOfferTag == null) {
                OfferTags offerTag = new OfferTags(offer, tag);
                offerTagsDao.saveAndFlush(offerTag);
            }
        }

        return offerId;
    }

    @Override
    @Transactional
    public int removeTagFromOffer(int offerId, long tagId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");

        Offer offer = OfferDao.getReferenceById(offerId);
        if (offer.getCompanyId() != user.getId()) {
            throw new RuntimeException("No tienes permiso para modificar esta oferta");
        }

        offerTagsDao.deleteByOfferIdAndTagId(offerId, tagId);
        return offerId;
    }

    @Override
    public List<TagDTO> getOfferTags(int offerId) {
        List<OfferTags> offerTags = offerTagsDao.findByOfferId(offerId);
        return offerTags.stream()
                .map(ot -> TagMapper.INSTANCE.toTagDTO(ot.getTag()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int replaceOfferTags(int offerId, List<Long> tagIds, String username) {
        if (tagIds.size() > MAX_TAGS_PER_OFFER) {
            throw new RuntimeException("Una oferta no puede tener más de " + MAX_TAGS_PER_OFFER + " tags");
        }
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer offer = OfferDao.getReferenceById(offerId);
        if (offer.getCompanyId() != user.getId()) {
            throw new RuntimeException("No tienes permiso para modificar esta oferta");
        }
        offerTagsDao.deleteByOfferId(offerId);
        for (Long tagId : tagIds) {
            Tag tag = tagDao.findById(tagId)
                    .orElseThrow(() -> new RuntimeException("Tag no encontrado: " + tagId));
            OfferTags offerTag = new OfferTags(offer, tag);
            offerTagsDao.saveAndFlush(offerTag);
        }
        return offerId;
    }

    @Override
    public List<TagDTO> getCandidateTags(String username) {
        User user = userDao.findByLogin(username);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado");
        }

        List<Tag> tags = candidateTagsDao.findCandidateTagsByCandidate(candidateDao.findCandidateByUser(user))
                .stream()
                .map(CandidateTags::getTag)
                .collect(Collectors.toList());
        return tags.stream()
                .map(TagMapper.INSTANCE::toTagDTO)
                .collect(Collectors.toList());
    }

    @Override
    public int updateCandidateTags(List<Integer> tagIds, String name) {
        User user = userDao.findByLogin(name);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado");
        }
        Candidate candidate = candidateDao.findCandidateByUser(user);
        if (candidate == null) {
            throw new RuntimeException("Candidato no encontrado");
        }
        candidateTagsDao.deleteByCandidate(candidate);

        for (Integer tagId : tagIds) {
            Tag tag = tagDao.findById(tagId.longValue())
                    .orElseThrow(() -> new RuntimeException("Tag no encontrado: " + tagId));
            CandidateTags candidateTag = new CandidateTags(candidate, tag);
            candidateTagsDao.saveAndFlush(candidateTag);
        }
        return user.getId();
    }

    @Override
    public int deleteCandidateTag(int tagId, String name) {
        User user = userDao.findByLogin(name);
        if (user == null) {
            throw new RuntimeException("Usuario no encontrado");
        }
        Candidate candidate = candidateDao.findCandidateByUser(user);
        if (candidate == null) {
            throw new RuntimeException("Candidato no encontrado");
        }
        return candidateTagsDao.deleteByCandidateIdAndTagId(candidate.getCandidate_id(), tagId);
    }


}
