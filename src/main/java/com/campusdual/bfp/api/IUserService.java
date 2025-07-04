package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface IUserService {

    boolean existsByUsername(String username);

    int registerNewUser(String username, String password, String email, String roleName);

    void registerNewCandidate(String username, String password, String email, String name,
                              String surname1, String surname2, String phoneNumber, String roleName,
                              String location, String professionalTitle, String yearsOfExperience, String educationLevel,
                              String languages, String employmentStatus,
                              String linkedinUrl, String githubUrl, String figmaUrl, String personalWebsiteUrl, int[]tags);

    void addRoleToUser(int userId, Long roleName);

    CandidateDTO getCandidateDetails(String username);

    UserDetails loadUserByUsername(String username);

    List<CompanyDTO> getAllCompanies();

    List<CandidateDTO> getAllCandidates();

    int addCompany(CompanyDTO companyDTO);

    int updateCompany(CompanyDTO companyDTO);

    int deleteCompany(int companyId);

    CandidateDTO updateCandidateDetails(String username, CandidateDTO candidateDTO);
}
