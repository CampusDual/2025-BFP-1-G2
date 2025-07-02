package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dao.UserRoleDao;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import org.springframework.beans.BeanUtils;
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

    @Autowired
    private UserDao userDao;

    @Autowired
    private UserRoleDao userRoleDao;

    @Autowired
    private UserService userService;

    public List<CompanyDTO> getAllCompanies() {
        return companyDao.findAll().stream()
                .map(CompanyMapper.INSTANCE::toDTO).collect(Collectors.toList());
    }

    public Optional<CompanyDTO> getCompanyById(Integer id) {
        return companyDao.findById(id).map(CompanyMapper.INSTANCE::toDTO);
    }

    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        User user = this.userDao.findByLogin(companyDTO.getLogin());
        if (user != null) {
            throw new RuntimeException("Empresa ya registrada");
        }
        userService.registerNewUser(companyDTO.getName(), "changeMe", companyDTO.getEmail(), "ROLE_COMPANY");
        Company company = CompanyMapper.INSTANCE.toEntity(companyDTO);
        company.setUser(this.userDao.findByLogin(companyDTO.getLogin()));
        return CompanyMapper.INSTANCE.toDTO(this.companyDao.saveAndFlush(company));
    }

    public CompanyDTO updateCompany(CompanyDTO companyDTO) {
        Company company = this.companyDao.findById(companyDTO.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        BeanUtils.copyProperties(companyDTO, company, "user_id");
        this.companyDao.saveAndFlush(company);
        return companyDTO;
    }

    public void deleteCompany(Integer id) {
        Company company = this.companyDao.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        this.userRoleDao.delete(userRoleDao.findUserRoleByUserId(company.getUser().getId()));
        this.offerDao.deleteAllByCompanyId(id);
        this.companyDao.deleteById(id);
        this.userDao.delete(company.getUser());
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
