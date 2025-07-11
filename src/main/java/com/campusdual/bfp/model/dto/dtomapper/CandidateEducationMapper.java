package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.CandidateEducation;
import com.campusdual.bfp.model.dto.CandidateEducationDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper
public interface CandidateEducationMapper {
    CandidateEducationMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CandidateEducationMapper.class);
    CandidateEducationDTO toDTO(CandidateEducation education);
    CandidateEducation toEntity(CandidateEducationDTO educationDTO);
    List<CandidateEducationDTO> toDTOList(List<CandidateEducation> educations);
    List<CandidateEducation> toEntityList(List<CandidateEducationDTO> educationDTOs);
}