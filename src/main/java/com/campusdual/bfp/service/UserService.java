package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IUserService;
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
        User user = this.userDao.findByLogin(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), user.getAuthorities());
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
    public void registerNewCandidate(String username, String password, String email, String name,
                                     String surname1, String surname2, String phoneNumber, String roleName,
                                     String location, String professionalTitle, String yearsOfExperience, String educationLevel,
                                     String languages, String employmentStatus, String profilePictureUrl, String curriculumUrl,
                                     String linkedinUrl, String githubUrl, String figmaUrl, String personalWebsiteUrl, int[] tags) {
        int id;
        Candidate candidate = new Candidate();
        candidate.setName(name);
        candidate.setSurname1(surname1);
        candidate.setSurname2(surname2);
        candidate.setPhoneNumber(phoneNumber);
        candidate.setLocation(location);
        candidate.setProfessionalTitle(professionalTitle);
        candidate.setYearsOfExperience(yearsOfExperience);
        candidate.setEducationLevel(educationLevel);
        candidate.setLanguages(languages);
        candidate.setEmploymentStatus(employmentStatus);
        candidate.setProfilePictureUrl(profilePictureUrl);
        candidate.setCurriculumUrl(curriculumUrl);
        candidate.setLinkedinUrl(linkedinUrl);
        candidate.setGithubUrl(githubUrl);
        candidate.setFigmaUrl(figmaUrl);
        candidate.setPersonalWebsiteUrl(personalWebsiteUrl);
        id = this.registerNewUser(username, password, email, roleName);
        candidate.setUser(this.userDao.findUserById(id));
        this.candidateDao.saveAndFlush(candidate);
        if (tags != null) {
            for (Integer tagId : tags) {
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
        candidateDTO.setProfilePictureUrl(candidate.getProfilePictureUrl());
        candidateDTO.setCurriculumUrl(candidate.getCurriculumUrl());
        candidateDTO.setLinkedinUrl(candidate.getLinkedinUrl());
        candidateDTO.setGithubUrl(candidate.getGithubUrl());
        candidateDTO.setFigmaUrl(candidate.getFigmaUrl());
        candidateDTO.setPersonalWebsiteUrl(candidate.getPersonalWebsiteUrl());
        return candidateDTO;
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
        System.out.println("Candidates found: " + candidates.size());
        List<CandidateDTO> candidateDTOs = CandidateMapper.INSTANCE.toDTOList(candidates);

        for (int i = 0; i < candidates.size(); i++) {
            Candidate candidate = candidates.get(i);
            CandidateDTO candidateDTO = candidateDTOs.get(i);

            if (candidate.getUser() == null) {
                System.out.println("Warning: Candidate without user found");
                continue;
            }

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
            throw new RuntimeException("Empresa ya registrada");
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
            throw new RuntimeException("Usuario no encontrado");
        }

        Candidate candidate = this.candidateDao.findCandidateByUser(user);
        if (candidate == null) {
            throw new RuntimeException("Candidato no encontrado");
        }

        // Validar duplicados solo si el login/email han cambiado
        if (!user.getLogin().equals(candidateDTO.getLogin())) {
            User existingUser = this.userDao.findByLogin(candidateDTO.getLogin());
            if (existingUser != null) {
                throw new RuntimeException("El nombre de usuario ya existe");
            }
        }

        if (!user.getEmail().equals(candidateDTO.getEmail())) {
            User existingUserByEmail = this.userDao.findByEmail(candidateDTO.getEmail());
            if (existingUserByEmail != null) {
                throw new RuntimeException("El email ya está en uso");
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
