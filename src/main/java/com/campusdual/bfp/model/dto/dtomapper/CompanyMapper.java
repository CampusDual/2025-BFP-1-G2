package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface CompanyMapper {
    CompanyMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CompanyMapper.class);

    @Mapping(source = "user.login", target = "login")
    @Mapping(source = "user.password", target = "password")
    @Mapping(source = "user.email", target = "email")
    @Mapping(target = "foundedDate", source = "foundedDate") // Asegurar el mapeo explícito
    CompanyDTO toDTO(Company company);


    @Mapping(target = "user.login", source = "login")
    @Mapping(target = "user.password", source = "password")
    @Mapping(target = "user.email", source = "email")
    @Mapping(target = "foundedDate", source = "foundedDate") // Asegurar el mapeo explícito
    Company toEntity(CompanyDTO companyDTO);
}
