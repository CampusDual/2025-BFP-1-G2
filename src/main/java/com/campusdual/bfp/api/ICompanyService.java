package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.dto.OfferDTO;

import java.util.List;
import java.util.Optional;

public interface ICompanyService {

    List<CompanyDTO> getAllCompanies();

    Optional<CompanyDTO> getCompanyById(Integer id);

    CompanyDTO getCompanyByName(String name);

    CompanyDTO createCompany(CompanyDTO company);

    CompanyDTO updateCompany(CompanyDTO company, String username);

    void deleteCompany(Integer id);

    List<CompanyDTO> searchCompanies(String searchTerm);

    List<CompanyDTO> getCompaniesByLocation(String location);

    Optional<CompanyDTO> getCompanyByUsername(String username);
}
