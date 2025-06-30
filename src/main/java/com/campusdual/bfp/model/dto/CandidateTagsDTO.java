package com.campusdual.bfp.model.dto;

import java.util.List;

public class CandidateTagsDTO {
    private int candidateId;
    private List<Long> tagIds;

    public CandidateTagsDTO() {
    }

    public List<Long> getTagIds() {
        return tagIds;
    }
}