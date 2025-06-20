package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyDao extends JpaRepository<Company, Integer> {
    Company findCompanyByUser(User user);
}