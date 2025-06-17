package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.dto.CandidateDTO;

import java.util.List;

public interface CandidateMapper {
    CandidateMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CandidateMapper.class);

    CandidateDTO toDTO(Candidate candidate);

    List<CandidateDTO> toDTOList(List<Candidate> candidates);

    Candidate toEntity(CandidateDTO candidateDTO);
}