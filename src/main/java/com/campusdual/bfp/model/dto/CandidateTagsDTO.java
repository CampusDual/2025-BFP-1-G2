package com.campusdual.bfp.model.dto;

import java.util.List;

public class CandidateTagsDTO {
    private int candidateId;
    private List<Integer> tagIds;

    public CandidateTagsDTO() {
    }

    public List<Integer> getTagIds() {
        return tagIds;
    }
}