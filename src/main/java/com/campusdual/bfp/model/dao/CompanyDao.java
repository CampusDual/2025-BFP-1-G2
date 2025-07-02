package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dto.CompanyDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompanyDao extends JpaRepository<Company, Integer> {
    Company findCompanyByUser(User user);

    // Buscar empresas por término en nombre, descripción o sector
    @Query("SELECT c FROM Company c WHERE " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<CompanyDTO> findBySearchTerm(@Param("searchTerm") String searchTerm);

    // Obtener empresas por ubicación
    List<Company> findByAddressContainingIgnoreCase(String location);
}