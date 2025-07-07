package com.campusdual.bfp.service;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.OfferTags;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.TagDTO;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import com.campusdual.bfp.model.dto.dtomapper.TagMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import com.campusdual.bfp.exception.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
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
    @Autowired
    private CandidateDao candidateDao;

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
        User user = this.userDao.findByLogin(username);
        if (user == null || ((user.getId() != (company.getUser().getId())) && user.getAuthorities()
                .stream().map(GrantedAuthority::getAuthority)
                .noneMatch(role -> role.equals("ROLE_ADMIN")))) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar esta empresa");
        }
        BeanUtils.copyProperties(companyDTO, company, "id", "user", "userId", "login");
        this.companyDao.saveAndFlush(company);
        return companyDTO;
    }

    public void deleteCompany(Integer id) {
        Company company = this.companyDao.findById(id)
                .orElseThrow(() -> new CompanyNotFoundException("Empresa no encontrada"));
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
        List<OfferDTO> offerDTOS =
        offers.stream()
                .map(offer -> {
                    OfferDTO offerDTO = OfferMapper.INSTANCE.toDTO(offer);
                    offerDTO.setDateAdded(offer.getDate());
                    return offerDTO;
                })
                .collect(Collectors.toList());
        for (OfferDTO offerDTO : offerDTOS) {
            offerDTO.setLogo(companyDao.findById(companyId)
                    .map(Company::getLogo)
                    .orElse(null));
            List<TagDTO> tagDTOs = getOfferTags(offerDTO.getId());
            offerDTO.setTags(tagDTOs);
            offerDTO.setCandidates(new ArrayList<>());
            userOfferDao.findUserIdsByOfferId(offerDTO.getId()).stream().map(candidateDao::findCandidateByUserId)
                    .forEach(candidate -> {
                        CandidateDTO candidateDTO = CandidateMapper.INSTANCE.toDTO(candidate);
                        offerDTO.getCandidates().add(candidateDTO);
                    });
        }
        return offerDTOS;
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

    @Override
    public List<OfferDTO> getCompanyOffersByStatus(String username, String status) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");

        Company company = companyDao.findCompanyByUser(user);
        if (company == null) throw new CompanyNotFoundException("Empresa no encontrada");

        List<Offer> offers = offerDao.findOffersByCompanyIdAndStatus(company.getId(), status);
        List<OfferDTO> offerDTOS = offers.stream()
                .map(OfferMapper.INSTANCE::toDTO)
                .collect(Collectors.toList());

        // Agregar logo como en getCompanyOffers
        for (OfferDTO offerDTO : offerDTOS) {
            offerDTO.setLogo(company.getLogo());
        }
        return offerDTOS;
    }

    @Override
    @Transactional
    public void publishOffer(int offerId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");

        Company company = companyDao.findCompanyByUser(user);
        if (company == null) throw new CompanyNotFoundException("Empresa no encontrada");

        Offer offer = offerDao.getReferenceById(offerId);
        if (offer.getCompany().getId() != company.getId()) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar esta oferta");
        }

        offer.setActive(true);
        offerDao.saveAndFlush(offer);
    }

    @Override
    @Transactional
    public void archiveOffer(int offerId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");

        Company company = companyDao.findCompanyByUser(user);
        if (company == null) throw new CompanyNotFoundException("Empresa no encontrada");

        Offer offer = offerDao.getReferenceById(offerId);
        if (offer.getCompany().getId() != company.getId()) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar esta oferta");
        }

        offer.setActive(false);
        offerDao.saveAndFlush(offer);
    }

    @Override
    @Transactional
    public void draftOffer(int offerId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");

        Company company = companyDao.findCompanyByUser(user);
        if (company == null) throw new CompanyNotFoundException("Empresa no encontrada");

        Offer offer = offerDao.getReferenceById(offerId);
        if (offer.getCompany().getId() != company.getId()) {
            throw new UnauthorizedOperationException("No tienes permiso para modificar esta oferta");
        }

        offer.setActive(null); // null = draft
        offerDao.saveAndFlush(offer);
    }

    private List<TagDTO> getOfferTags(int offerId) {
        List<OfferTags> offerTags = offerTagsDao.findByOfferId(offerId);
        return offerTags.stream()
                .map(ot -> TagMapper.INSTANCE.toTagDTO(ot.getTag()))
                .collect(Collectors.toList());
    }
}
