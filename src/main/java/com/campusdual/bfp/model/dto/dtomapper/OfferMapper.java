package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.mapstruct.Mapper;

@Mapper
public interface OfferMapper {
    OfferMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(OfferMapper.class);
    OfferDTO toDTO(Offer offer);
    Offer toEntity(OfferDTO offerDto);
}
