package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper
public interface OfferMapper {
    OfferMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(OfferMapper.class);
    OfferDTO toDTO(Offer Offer);
    List<OfferDTO> toDTOList(List<Offer> Offers);
    Offer toEntity(OfferDTO Offerdto);
}