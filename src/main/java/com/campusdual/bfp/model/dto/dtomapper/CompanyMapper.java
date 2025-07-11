package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface CompanyMapper {
    CompanyMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(CompanyMapper.class);

    @Mapping(source = "name", target = "name") // Company.user.login -> CompanyDTO.login (heredado de SignupDTO)
    @Mapping(source = "user.email", target = "email") // Company.user.email -> CompanyDTO.email (heredado de SignupDTO)
    @Mapping(source = "id", target = "id")
    @Mapping(source = "logo", target = "logo")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "url", target = "url")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "foundedDate", target = "foundedDate")
    CompanyDTO toDTO(Company company);

    @Mapping(target = "user", ignore = true) // Se maneja en el servicio
    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "logo", target = "logo")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "url", target = "url")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "foundedDate", target = "foundedDate")
    Company toEntity(CompanyDTO companyDTO);

    List<CompanyDTO> toDTOs(List<Company> companies);
}
