package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.TagDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ITagService {
    long addTag(String tag);
    List<TagDTO> getAllTags();
    long deleteTag(long tagId);
    long updateTag(long id, String name);
    int addTagsToOffer(int offerId, List<Long> tagIds, String username);
    int removeTagFromOffer(int offerId, long tagId, String username);
    List<TagDTO> getOfferTags(int offerId);
    int replaceOfferTags(int offerId, List<Long> tagIds, String username);
    List<TagDTO> getCandidateTags(String name);
    int updateCandidateTags(List<Integer> tagIds, String name);
    int deleteCandidateTag(int tagId, String name);
    List<TagDTO> getMostFrequentTags();
}
