package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.dto.OfferDTO;

import java.util.List;
import java.util.Optional;

public interface ICompanyService {

    List<CompanyDTO> getAllCompanies();

    Optional<CompanyDTO> getCompanyById(Integer id);

    CompanyDTO createCompany(CompanyDTO company);

    CompanyDTO updateCompany(CompanyDTO company);

    void deleteCompany(Integer id);

    List<CompanyDTO> searchCompanies(String searchTerm);

    List<OfferDTO> getCompanyOffers(Integer companyId);

    List<CompanyDTO> getCompaniesByLocation(String location);
}
