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

    UserDetails loadUserByUsername(String username);

    List<CompanyDTO> getAllCompanies();

    List<CandidateDTO> getAllCandidates();

    int addCompany(CompanyDTO companyDTO);

    int updateCompany(CompanyDTO companyDTO);

    int deleteCompany(int companyId);

    CandidateDTO updateCandidateDetails(String username, CandidateDTO candidateDTO);


}
