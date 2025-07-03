package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OfferDao extends JpaRepository<Offer, Integer> {

    // Buscar ofertas por ID de empresa (relación directa)
    @Query("SELECT o FROM Offer o WHERE o.company.id = :companyId")
    List<Offer> findOfferByCompanyId(@Param("companyId") int companyId);

    // Buscar ofertas por ID de usuario (a través de la empresa)
    @Query("SELECT o FROM Offer o WHERE o.company.user.id = :userId")
    List<Offer> findOffersByUserId(@Param("userId") int userId);

    // Eliminar todas las ofertas de una empresa específica
    @Query("DELETE FROM Offer o WHERE o.company.id = :companyId")
    int deleteAllByCompanyId(@Param("companyId") int companyId);

    // Buscar ofertas activas por ID de empresa
    @Query("SELECT o FROM Offer o WHERE o.company.id = :companyId AND o.active = true")
    List<Offer> findActiveOffersByCompanyId(@Param("companyId") int companyId);

    // Buscar ofertas activas por ID de usuario
    @Query("SELECT o FROM Offer o WHERE o.company.user.id = :userId AND o.active = true")
    List<Offer> findActiveOffersByUserId(@Param("userId") int userId);

    @Query("SELECT o FROM Offer o WHERE o.company.id = :companyId AND " +
            "(:status = 'draft' AND o.active IS NULL) OR " +
            "(:status = 'active' AND o.active = true) OR " +
            "(:status = 'archived' AND o.active = false)")
    List<Offer> findOffersByCompanyIdAndStatus(@Param("companyId") int companyId, @Param("status") String status);

}
