package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.dto.CandidateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface CandidateMapper {
    CandidateMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CandidateMapper.class);

    @Mapping(source = "user.login", target = "login")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "phoneNumber", target = "phoneNumber")
    @Mapping(source = "cvPdfBase64", target = "cvPdfBase64")
    @Mapping(source = "logoImageBase64", target = "logoImageBase64")
    CandidateDTO toDTO(Candidate candidate);

    List<CandidateDTO> toDTOList(List<Candidate> candidates);

    @Mapping(target = "user.login", source = "login")
    @Mapping(target = "user.email", source = "email")
    @Mapping(target = "cvPdfBase64", source = "cvPdfBase64")
    @Mapping(target = "logoImageBase64", source = "logoImageBase64")
    Candidate toEntity(CandidateDTO candidateDTO);
}