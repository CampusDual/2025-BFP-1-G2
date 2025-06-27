package com.campusdual.bfp.model.dto;

import java.util.List;

public class OfferTagsDTO {
    private int offerId;
    private List<Long> tagIds;

    public OfferTagsDTO() {}

    public List<Long> getTagIds() { return tagIds; }
}