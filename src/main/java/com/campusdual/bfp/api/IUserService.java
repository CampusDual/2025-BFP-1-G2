package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface IUserService {

    boolean existsByUsername(String username);

    int registerNewUser(String username, String password, String email, String roleName);

    void registerNewCandidate(CandidateDTO candidateDTO);

    void addRoleToUser(int userId, Long roleName);

    CandidateDTO getCandidateDetails(String username);

    CompanyDTO getCompanyDetails(String username);

    UserDetails loadUserByUsername(String username);

    List<CompanyDTO> getAllCompanies();

    List<CandidateDTO> getAllCandidates();

    int addCompany(CompanyDTO companyDTO);

    int updateCompany(CompanyDTO companyDTO);

    int deleteCompany(int companyId);

    CandidateDTO updateCandidateDetails(String username, CandidateDTO candidateDTO);


    void deleteCandidateExperience(Long id, String username);

    CandidateExperienceDTO createCandidateExperience(String username, CandidateExperienceDTO experienceDTO);

    void deleteCandidateEducation(Long id, String username);

    CandidateEducationDTO createCandidateEducation(String username, CandidateEducationDTO educationDTO);
}
