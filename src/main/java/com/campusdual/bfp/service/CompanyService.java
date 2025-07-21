package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.campusdual.bfp.exception.*;

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
    @Autowired
    private OfferTagsDao offerTagsDao;
    @Autowired
    private UserOfferDao userOfferDao;

    public List<CompanyDTO> getAllCompanies() {
        return companyDao.findAll().stream()
                .map(CompanyMapper.INSTANCE::toDTO).collect(Collectors.toList());
    }

    public Optional<CompanyDTO> getCompanyById(Integer id) {
        return companyDao.findById(id).map(CompanyMapper.INSTANCE::toDTO);
    }

    public CompanyDTO getCompanyByName(String name) {
        return CompanyMapper.INSTANCE.toDTO(companyDao.findByName(name));
    }

    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        User user = this.userDao.findByLogin(companyDTO.getName());
        if (user != null) {
            throw new CompanyAlreadyExistsException("Empresa ya registrada");
        }
        userService.registerNewUser(companyDTO.getName(), "changeMe", companyDTO.getEmail(), "ROLE_COMPANY");
        Company company = CompanyMapper.INSTANCE.toEntity(companyDTO);
        company.setUser(this.userDao.findByLogin(companyDTO.getName()));
        return CompanyMapper.INSTANCE.toDTO(this.companyDao.saveAndFlush(company));
    }

    public CompanyDTO updateCompany(CompanyDTO companyDTO, String username) {
        Company company = this.companyDao.findById(companyDTO.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        UserDetails userDetails = userService.loadUserByUsername(username);
        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()).contains("ROLE_ADMIN");
        User user = this.userDao.findByLogin(username);
        if (user == null || ((user.getId() != (company.getUser().getId())) && !isAdmin)) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar esta empresa");
        }
        BeanUtils.copyProperties(companyDTO, company, "id", "user", "userId", "login");
        this.companyDao.saveAndFlush(company);
        return companyDTO;
    }
    public void deleteCompany(Integer id) {
        Company company = this.companyDao.findById(id)
                .orElseThrow(() -> new CompanyNotFoundException("Empresa no encontrada"));

        if (companyDao.hasOffers(id)){
            throw new CompanyHasOffersException("No se puede eliminar la empresa porque tiene ofertas activas asociadas");
        }
        List<Offer> offers = offerDao.findOfferByCompanyId(id);
        if (!offers.isEmpty()) {
            for (Offer offer : offers) {
                offerTagsDao.deleteAll(offerTagsDao.findByOfferId(offer.getId()));
                userOfferDao.deleteAll(userOfferDao.findUserOffersByOfferId(offer.getId()));
            }
            offerDao.deleteAll(offers);
        }
        this.companyDao.deleteById(id);

        if (company.getUser() != null) {
            var userRole = userRoleDao.findUserRoleByUserId(company.getUser().getId());
            if (userRole != null) {
                this.userRoleDao.delete(userRole);
            }
            this.userDao.delete(company.getUser());
        }
    }

    public List<CompanyDTO> searchCompanies(String searchTerm) {
        return companyDao.findBySearchTerm(searchTerm);
    }

    public List<CompanyDTO> getCompaniesByLocation(String location) {
        return CompanyMapper.INSTANCE.toDTOs(companyDao.findByAddressContainingIgnoreCase(location));
    }

    public Optional<CompanyDTO> getCompanyByUsername(String username) {
        User user = userDao.findByLogin(username);
        if (user == null) {
            return Optional.empty();
        }
        Company company = companyDao.findCompanyByUser(user);
        return Optional.of(CompanyMapper.INSTANCE.toDTO(company));
    }

}
