package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface CompanyMapper {
    CompanyMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CompanyMapper.class);

    @Mapping(source = "user.login", target = "login") // Company.user.login -> CompanyDTO.login (heredado de SignupDTO)
    @Mapping(source = "user.email", target = "email") // Company.user.email -> CompanyDTO.email (heredado de SignupDTO)
    @Mapping(source = "id", target = "id")
    @Mapping(source = "logo", target = "logo")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "url", target = "url")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "foundedDate", target = "foundedDate")
    @Mapping(target = "password", ignore = true) // Se maneja aparte
    CompanyDTO toDTO(Company company);

    @Mapping(target = "user", ignore = true) // Se maneja en el servicio
    @Mapping(source = "id", target = "id")
    @Mapping(source = "logo", target = "logo")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "url", target = "url")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "foundedDate", target = "foundedDate")
    @Mapping(target = "offers", ignore = true) // Se maneja aparte
    Company toEntity(CompanyDTO companyDTO);

    List<CompanyDTO> toDTOs(List<Company> companies);
}
