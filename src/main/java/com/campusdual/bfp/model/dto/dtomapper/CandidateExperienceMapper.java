package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.CandidateExperience;
import com.campusdual.bfp.model.dto.CandidateExperienceDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper
public interface CandidateExperienceMapper {
    CandidateExperienceMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CandidateExperienceMapper.class);
    CandidateExperienceDTO toDTO(CandidateExperience experience);
    CandidateExperience toEntity(CandidateExperienceDTO experienceDTO);
    List<CandidateExperienceDTO> toDTOList(List<CandidateExperience> experiences);
    List<CandidateExperience> toEntityList(List<CandidateExperienceDTO> experienceDTOs);
}