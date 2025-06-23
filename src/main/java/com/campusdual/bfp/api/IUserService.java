package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;
import java.util.List;

public interface IUserService {

    boolean existsByUsername(String username);

    int registerNewUser(String username, String password, String email, String roleName);

    void registerNewCandidate(String username, String password, String email, String name,
                              String surname1, String surname2, String phoneNumber, String roleName);

    void addRoleToUser(int userId, Long roleName);

    CandidateDTO getCandidateDetails(String username);

    UserDetails loadUserByUsername(String username);

    List<CompanyDTO> getAllCompanies();

    int addCompany(CompanyDTO companyDTO);

    int updateCompany(CompanyDTO companyDTO);

    int deleteCompany(int companyId);
}
