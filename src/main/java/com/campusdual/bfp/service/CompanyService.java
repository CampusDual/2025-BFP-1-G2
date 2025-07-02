package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompanyService implements ICompanyService {

    @Autowired
    private CompanyDao companyDao;

    @Autowired
    private OfferDao offerDao;

    public List<CompanyDTO> getAllCompanies() {
        return companyDao.findAll().stream()
                .map(CompanyMapper.INSTANCE::toDTO).collect(Collectors.toList());
    }

    public Optional<CompanyDTO> getCompanyById(Integer id) {
        return companyDao.findById(id).map(CompanyMapper.INSTANCE::toDTO);
    }

    public CompanyDTO createCompany(CompanyDTO company) {
        Company entity = CompanyMapper.INSTANCE.toEntity(company);
        Company saved = companyDao.save(entity);
        return CompanyMapper.INSTANCE.toDTO(saved);    }

    public CompanyDTO updateCompany(CompanyDTO company) {
        return createCompany(company);
    }

    public void deleteCompany(Integer id) {
        companyDao.deleteById(id);
    }

    public List<CompanyDTO> searchCompanies(String searchTerm) {
        return companyDao.findBySearchTerm(searchTerm);
    }


    public List<OfferDTO> getCompanyOffers(Integer companyId) {
        List<Offer> offers = offerDao.findOfferByCompanyId(companyId);
        return offers.stream()
                .map(OfferMapper.INSTANCE::toDTO)
                .collect(Collectors.toList());
    }


    public List<CompanyDTO> getCompaniesByLocation(String location) {
        return CompanyMapper.INSTANCE.toDTOs(companyDao.findByAddressContainingIgnoreCase(location));
    }
}
