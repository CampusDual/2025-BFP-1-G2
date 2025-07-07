package com.campusdual.bfp.model.dto;

import java.util.List;

public class CandidateTagsDTO {
    private List<Integer> tagIds;

    public CandidateTagsDTO(List<Integer> tagIds) {
        this.tagIds = tagIds;
    }

    public List<Integer> getTagIds() {
        return tagIds;
    }
}