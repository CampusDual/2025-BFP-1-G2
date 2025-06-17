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
    @Mapping(source = "user.password", target = "password")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "phoneNumber", target = "phoneNumber")
    CandidateDTO toDTO(Candidate candidate);

    List<CandidateDTO> toDTOList(List<Candidate> candidates);

    @Mapping(target = "user.login", source = "login")
    @Mapping(target = "user.password", source = "password")
    @Mapping(target = "user.email", source = "email")
    Candidate toEntity(CandidateDTO candidateDTO);
}