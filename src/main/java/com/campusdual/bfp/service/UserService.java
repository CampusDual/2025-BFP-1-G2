package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IUserService;
import com.campusdual.bfp.model.*;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.CompanyDTO;
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

import java.util.Date;
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
    private OfferDao offerDao;

    @Autowired
    private CompanyDao companyDao;


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

    @Override
    public void registerNewCandidate(String username, String password, String email, String name,
                                     String surname1, String surname2, String phoneNumber, String roleName) {
        int id;
        Candidate candidate = new Candidate();
        candidate.setName(name);
        candidate.setSurname1(surname1);
        candidate.setSurname2(surname2);
        candidate.setPhoneNumber(phoneNumber);
        id = this.registerNewUser(username, password, email, roleName);
        candidate.setUser(this.userDao.findUserById(id));
        this.candidateDao.saveAndFlush(candidate);
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
        System.out.println("Candidate: " + candidate);
        System.out.println("User: " + user);
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
        return candidateDTO;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



    @Override
    public List<CompanyDTO> getAllCompanies() {
        return companyDao.findAll().stream()
                .map(CompanyMapper.INSTANCE::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public int addCompany(CompanyDTO companyDTO) {
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
}
