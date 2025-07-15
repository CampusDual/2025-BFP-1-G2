package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IUserService;
import com.campusdual.bfp.exception.*;
import com.campusdual.bfp.model.*;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Lazy
public class UserService implements UserDetailsService, IUserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private UserRoleDao userRoleDao;

    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private CandidateTagsDao candidateTagsDao;

    @Autowired
    private OfferDao offerDao;

    @Autowired
    private CompanyDao companyDao;

    @Autowired
    private UserOfferDao userOfferDao;
    @Autowired
    private TagDao tagDao;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userDao.findByLogin(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        List<UserRole> userRoles = userRoleDao.findUserRolesByUser(user);
        List<GrantedAuthority> authorities = userRoles.stream()
                .map(userRole -> new SimpleGrantedAuthority(userRole.getRole().getRoleName()))
                .collect(Collectors.toList());
        if (authorities.isEmpty()) {
            Candidate candidate = candidateDao.findCandidateByUser(user);
            Company company = companyDao.findCompanyByUser(user);

            if (candidate != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_CANDIDATE"));
            } else if (company != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_COMPANY"));
            }
        }
        return new org.springframework.security.core.userdetails.User(
                user.getLogin(),
                user.getPassword(),
                authorities
        );
    }

    @Override
    public boolean existsByUsername(String username) {
        User user = this.userDao.findByLogin(username);
        return user != null;
    }

    @Override
    public int registerNewUser(String username, String password, String email, String roleName) {
        User user = new User();
        user.setLogin(username);
        user.setPassword(this.passwordEncoder().encode(password));
        user.setEmail(email);
        User savedUser = this.userDao.saveAndFlush(user);

        Role role = this.roleDao.findByRoleName(roleName);
        if (role != null) {
            UserRole userRole = new UserRole();
            userRole.setUser(savedUser);
            userRole.setRole(role);
            this.userRoleDao.saveAndFlush(userRole);
        }

        return savedUser.getId();
    }

    @Transactional
    @Override
    public void registerNewCandidate(CandidateDTO candidateDTO) {
        int id;
        Candidate candidate = CandidateMapper.INSTANCE.toEntity(candidateDTO);
        id = this.registerNewUser(candidateDTO.getLogin(), candidateDTO.getPassword(), candidateDTO.getEmail(), "ROLE_CANDIDATE");
        candidate.setUser(this.userDao.findUserById(id));
        this.candidateDao.saveAndFlush(candidate);
        if (candidateDTO.getTagIds() != null) {
            for (Integer tagId : candidateDTO.getTagIds()) {
                Tag tag = tagDao.findById(tagId.longValue()).orElse(null);
                if (tag != null) {
                    CandidateTags candidateTag = new CandidateTags(candidate, tag);
                    candidateTagsDao.save(candidateTag);
                }
            }
        }
    }

    @Override
    public void addRoleToUser(int userId, Long roleName) {
        User user = this.userDao.findUserById(userId);
        if (user != null) {
            Role role = this.roleDao.findById(roleName)
                    .orElse(null);
            if (userRoleDao.findUserRoleByUserAndRole(user, role) == null && role != null) {
                UserRole userRole = new UserRole();
                userRole.setUser(user);
                userRole.setRole(role);
                this.userRoleDao.saveAndFlush(userRole);
            }
        }
    }

    @Override
    public CandidateDTO getCandidateDetails(String username) {
        User user = this.userDao.findByLogin(username);
        if (user == null) {
            return null;
        }
        Candidate candidate = this.candidateDao.findCandidateByUser(user);
        if (candidate == null) {
            return null;
        }
        CandidateDTO candidateDTO = new CandidateDTO();
        candidateDTO.setId(user.getId());
        candidateDTO.setLogin(user.getLogin());
        candidateDTO.setEmail(user.getEmail());
        candidateDTO.setName(candidate.getName());
        candidateDTO.setSurname1(candidate.getSurname1());
        candidateDTO.setSurname2(candidate.getSurname2());
        candidateDTO.setPhoneNumber(candidate.getPhoneNumber());
        candidateDTO.setLocation(candidate.getLocation());
        candidateDTO.setProfessionalTitle(candidate.getProfessionalTitle());
        candidateDTO.setYearsOfExperience(candidate.getYearsOfExperience());
        candidateDTO.setEducationLevel(candidate.getEducationLevel());
        candidateDTO.setLanguages(candidate.getLanguages());
        candidateDTO.setEmploymentStatus(candidate.getEmploymentStatus());
        candidateDTO.setLinkedinUrl(candidate.getLinkedinUrl());
        candidateDTO.setGithubUrl(candidate.getGithubUrl());
        candidateDTO.setFigmaUrl(candidate.getFigmaUrl());
        candidateDTO.setPersonalWebsiteUrl(candidate.getPersonalWebsiteUrl());

        // Agregar los nuevos campos
        candidateDTO.setCvPdfBase64(candidate.getCvPdfBase64());
        candidateDTO.setLogoImageBase64(candidate.getLogoImageBase64());

        return candidateDTO;
    }

    public CompanyDTO getCompanyDetails(String username){
        User user = this.userDao.findByLogin(username);
        if (user == null) {
            return null;
        }
        Company company = this.companyDao.findCompanyByUser(user);
        if (company == null) {
            return null;
        }
        CompanyDTO companyDTO = new CompanyDTO();
        companyDTO.setId(company.getId());
        companyDTO.setName(company.getName());
        companyDTO.setLogin(user.getLogin());
        companyDTO.setEmail(user.getEmail());
        companyDTO.setDescription(company.getDescription());
        return companyDTO;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public List<CompanyDTO> getAllCompanies() {
        List<CompanyDTO> companies = companyDao.findAll().stream()
                .map(CompanyMapper.INSTANCE::toDTO)
                .collect(Collectors.toList());
        for (CompanyDTO company : companies) {
            User user = this.userDao.findByLogin(company.getLogin());
            if (user != null) {
                company.setLogin(user.getLogin());
                company.setEmail(user.getEmail());
            } else {
                company.setEmail("No email found");
            }
        }
        return companies;
    }

    @Override
    public List<CandidateDTO> getAllCandidates() {
        List<Candidate> candidates = this.candidateDao.findAll();
        List<CandidateDTO> candidateDTOs = CandidateMapper.INSTANCE.toDTOList(candidates);
        for (int i = 0; i < candidates.size(); i++) {
            Candidate candidate = candidates.get(i);
            CandidateDTO candidateDTO = candidateDTOs.get(i);
            candidateDTO.setAllDates(userOfferDao.findDatesByUserId(candidate.getUser().getId()).stream()
                    .map(date -> new java.text.SimpleDateFormat("dd/MM/yyyy").format(date))
                    .toArray(String[]::new));
        }
        return candidateDTOs;
    }

    @Override
    public int addCompany(CompanyDTO companyDTO) {
        companyDTO.setId(0);
        User user = this.userDao.findByLogin(companyDTO.getLogin());
        if (user != null) {
            throw new CompanyAlreadyExistsException("Empresa ya registrada");
        }
        registerNewUser(companyDTO.getName(), "changeMe", companyDTO.getEmail(), "ROLE_COMPANY");
        Company company = CompanyMapper.INSTANCE.toEntity(companyDTO);
        company.setUser(this.userDao.findByLogin(companyDTO.getLogin()));
        this.companyDao.saveAndFlush(company);
        return company.getId();
    }

    @Override
    public int updateCompany(CompanyDTO companyDTO) {
        Company company = this.companyDao.findById(companyDTO.getId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        BeanUtils.copyProperties(companyDTO, company, "user_id");
        if (!company.getUser().getEmail().equals(companyDTO.getEmail()) || !company.getUser().getLogin().equals(companyDTO.getLogin())) {
            company.getUser().setEmail(companyDTO.getEmail());
            company.getUser().setLogin(companyDTO.getLogin());
            this.userDao.saveAndFlush(company.getUser());
        }
        this.companyDao.saveAndFlush(company);
        return company.getId();
    }

    @Override
    public int deleteCompany(int companyId) {
        Company company = this.companyDao.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        this.userRoleDao.delete(userRoleDao.findUserRoleByUserId(company.getUser().getId()));
        this.offerDao.deleteAllByCompanyId(companyId);
        this.companyDao.deleteById(companyId);
        this.userDao.delete(company.getUser());
        return companyId;
    }

    @Override
    @Transactional
    public CandidateDTO updateCandidateDetails(String username, CandidateDTO candidateDTO) {
        // Validaciones iniciales
        if (candidateDTO == null) {
            throw new IllegalArgumentException("Los datos del candidato no pueden ser nulos");
        }

        User user = this.userDao.findByLogin(username);
        if (user == null) {
            throw new UserNotFoundException("Usuario no encontrado");
        }

        Candidate candidate = this.candidateDao.findCandidateByUser(user);
        if (candidate == null) {
            throw new CandidateNotFoundException("Candidato no encontrado");
        }

        // Validar duplicados solo si el login/email han cambiado
        if (!user.getLogin().equals(candidateDTO.getLogin())) {
            User existingUser = this.userDao.findByLogin(candidateDTO.getLogin());
            if (existingUser != null) {
                throw new DuplicateUserException("El nombre de usuario ya existe");
            }
        }

        if (!user.getEmail().equals(candidateDTO.getEmail())) {
            User existingUserByEmail = this.userDao.findByEmail(candidateDTO.getEmail());
            if (existingUserByEmail != null) {
                throw new DuplicateEmailException("El email ya está en uso");
            }
        }

        // Actualizar datos del candidato
        BeanUtils.copyProperties(candidateDTO, candidate, "id", "user");

        // Actualizar datos del usuario
        user.setEmail(candidateDTO.getEmail());
        user.setLogin(candidateDTO.getLogin());

        // Guardar cambios
        this.userDao.saveAndFlush(user);
        this.candidateDao.saveAndFlush(candidate);

        return CandidateMapper.INSTANCE.toDTO(candidate);
    }
}
