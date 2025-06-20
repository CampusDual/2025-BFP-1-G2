package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface CompanyMapper {
    CompanyMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CompanyMapper.class);

    @Mapping(target = "foundedDate", source = "foundedDate") // Asegurar el mapeo explícito
    CompanyDTO toDTO(Company company);

    @Mapping(target = "foundedDate", source = "foundedDate") // Asegurar el mapeo explícito
    Company toEntity(CompanyDTO companyDTO);
}
