package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.mapstruct.*;

import java.util.stream.Collectors;

@Mapper
public interface OfferMapper {
    OfferMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(OfferMapper.class);

    @Mapping(target = "dateAdded", source = "date")
    @Mapping(target = "companyName", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "logo", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "candidates", ignore = true)
    OfferDTO toDTO(Offer offer,
                   @Context boolean isCompany,
                   @Context OfferDao offerDao,
                   @Context User user);

    @AfterMapping
    default void mapCompanyInfo(@MappingTarget OfferDTO dto, Offer offer,
                                @Context boolean isCompany,
                                @Context OfferDao offerDao,
                                @Context User user) {
        Company company = offerDao.findCompanyByOfferId(offer.getId());
        if (company.getLogo() != null) {
            dto.setLogo(company.getLogo());
        }
        if (!isCompany){
            User compUser = company.getUser();
            dto.setCompanyName(company.getName());
            dto.setEmail(compUser.getEmail());
            if (user != null) {
                dto.setIsApplied(offerDao.isOfferAppliedByUserIdAndOfferId(user.getId(), offer.getId()));
                offerDao.getAppliedByUserIdAndOfferId(user.getId(), offer.getId())
                        .ifPresent(dto::setCandidateValid);
                dto.setBookmarked(offerDao.isOfferBookmarkedByUserIdAndOfferId(user.getId(), offer.getId()));
            }
        }
        dto.setTags(offerDao.findTagsByOfferId(offer.getId()).stream()
                .map(TagMapper.INSTANCE::toTagDTO)
                .collect(Collectors.toList()));
    }

    Offer toEntity(OfferDTO offerDto);

}
