package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IUserService;
import com.campusdual.bfp.exception.*;
import com.campusdual.bfp.model.*;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.*;
import com.campusdual.bfp.model.dto.dtomapper.CandidateEducationMapper;
import com.campusdual.bfp.model.dto.dtomapper.CandidateMapper;
import com.campusdual.bfp.model.dto.dtomapper.CompanyMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

import com.campusdual.bfp.model.dto.dtomapper.CandidateExperienceMapper;

@Service
@Lazy
public class UserService implements UserDetailsService, IUserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        user.setPassword(passwordEncoder.encode(password));
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
        candidate.setDateAdded(new java.util.Date());
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
        if (candidate.getExperiences() != null) {
            candidateDTO.setExperiences(
                    CandidateExperienceMapper.INSTANCE.toDTOList(candidate.getExperiences())
            );
        }
        if (candidate.getEducations() != null) {
            candidateDTO.setEducations(
                    CandidateEducationMapper.INSTANCE.toDTOList(candidate.getEducations())
            );
        }
        return candidateDTO;
    }

    public CompanyDTO getCompanyDetails(String username) {
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
    public List<MonthlyCountDTO> getAllCandidates() {
        List<Object[]> candidates = this.candidateDao.countRegisteredCandidatesByMonth();
        return candidates.stream()
                .map(obj -> new MonthlyCountDTO(
                        (int) obj[0], // mes
                        (int) obj[1], // año
                        (long) obj[2] // conteo
                ))
                .collect(Collectors.toList());
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

        User user = company.getUser(); // Usar el usuario actual de la empresa

        // Actualizar email y login si han cambiado
        if (!user.getEmail().equals(companyDTO.getEmail()) ||
                !user.getLogin().equals(companyDTO.getLogin())) {
            user.setEmail(companyDTO.getEmail());
            user.setLogin(companyDTO.getLogin());
        }

        // Actualizar contraseña si se proporciona
        if (!companyDTO.getPassword().isEmpty()) {
            user.setPassword(this.passwordEncoder.encode(companyDTO.getPassword()));
        }

        // Guardar una sola vez
        this.userDao.saveAndFlush(user);
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
        BeanUtils.copyProperties(candidateDTO, candidate, "id", "user");

        // Actualizar datos del usuario
        user.setEmail(candidateDTO.getEmail());
        user.setLogin(candidateDTO.getLogin());

        // Guardar cambios
        this.userDao.saveAndFlush(user);
        this.candidateDao.saveAndFlush(candidate);

        return candidateDTO;
    }


    @Transactional
    public Integer deleteCandidateExperience(Long experienceId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Candidate candidate = candidateDao.findCandidateByUser(user);
        if (candidate == null) throw new CandidateNotFoundException("Candidato no encontrado");
        CandidateExperience toDelete = candidate.getExperiences().stream()
                .filter(exp -> exp.getId().equals(experienceId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Experiencia no encontrada"));
        candidate.getExperiences().remove(toDelete);
        return candidateDao.saveAndFlush(candidate).getCandidateId();
    }

    @Transactional
    public CandidateExperienceDTO createCandidateExperience(String username, CandidateExperienceDTO experienceDTO) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Candidate candidate = candidateDao.findCandidateByUser(user);
        if (candidate == null) throw new CandidateNotFoundException("Candidato no encontrado");

        CandidateExperience experience = CandidateExperienceMapper.INSTANCE.toEntity(experienceDTO);
        experience.setCandidate(candidate);
        candidate.getExperiences().add(experience);
        candidateDao.saveAndFlush(candidate);

        CandidateExperience savedExperience = experience;
        if (experience.getId() == null && candidate.getExperiences() != null && !candidate.getExperiences().isEmpty()) {
            savedExperience = candidate.getExperiences().get(candidate.getExperiences().size() - 1);
        }
        return CandidateExperienceMapper.INSTANCE.toDTO(savedExperience);
    }

    @Transactional
    public Integer deleteCandidateEducation(Long educationId, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Candidate candidate = candidateDao.findCandidateByUser(user);
        if (candidate == null) throw new CandidateNotFoundException("Candidato no encontrado");
        CandidateEducation toDelete = candidate.getEducations().stream()
                .filter(edu -> edu.getId().equals(educationId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Educación no encontrada"));
        candidate.getEducations().remove(toDelete);
        return candidateDao.saveAndFlush(candidate).getCandidateId();
    }

    @Transactional
    public CandidateEducationDTO createCandidateEducation(String username, CandidateEducationDTO educationDTO) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new UserNotFoundException("Usuario no encontrado");
        Candidate candidate = candidateDao.findCandidateByUser(user);
        if (candidate == null) throw new CandidateNotFoundException("Candidato no encontrado");

        CandidateEducation education = CandidateEducationMapper.INSTANCE.toEntity(educationDTO);
        education.setCandidate(candidate);
        candidate.getEducations().add(education);
        candidateDao.saveAndFlush(candidate); // Guarda en cascada

        CandidateEducation savedEducation = education;
        if (education.getId() == null && candidate.getEducations() != null && !candidate.getEducations().isEmpty()) {
            savedEducation = candidate.getEducations().get(candidate.getEducations().size() - 1);
        }

        return CandidateEducationMapper.INSTANCE.toDTO(savedEducation);
    }

    public Page<CandidateDTO> getCandidatesFromMyOffers(Integer offerId, int page, int size) {
        return candidateDao.findAppliedCandidatesFromOffer(offerId, PageRequest.of(page, size))
                .map(candidate -> CandidateMapper.INSTANCE.toDTO(candidate, offerId, offerDao));
    }

    public Page<CandidateDTO> getRecomendedCandidatesFromMyOffer(
            Integer offerId,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Candidate> results = candidateDao.findCandidatesByOfferTags(offerId, pageable);
        return results.map(candidate -> {
            CandidateDTO candidateDTO = CandidateMapper.INSTANCE.toDTO(candidate, offerId, offerDao);
            List<String> tagNames = candidateDao.findTagsNamesByCandidateIdAndOfferId(candidate.getCandidateId(), offerId);
            candidateDTO.setCoincidences(tagNames);
            return candidateDTO;
        });
    }
}
