package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.CandidateBookmarks;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.CandidateBookmarksDao;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.MonthlyCountDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.campusdual.bfp.model.dao.CompanyDao;
import com.campusdual.bfp.model.Company;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/offer")
public class OfferController {

    @Autowired
    private IOfferService offerService;

    @Autowired
    private CandidateBookmarksDao candidateBookmarksDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private OfferDao offerDao;

    @Autowired
    private CompanyDao companyDao;

    @GetMapping
    public ResponseEntity<String> testController() {
        return ResponseEntity.ok("Offers controller works!");
    }

    @PostMapping
    public ResponseEntity<String> testController(@RequestBody String name) {
        return ResponseEntity.ok("Offers controller works, " + name + "!");
    }

    @GetMapping(value = "/testMethod")
    public ResponseEntity<String> testControllerMethod() {
        return ResponseEntity.ok("Offers controller method works!");
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping(value = "/getAll")
    public ResponseEntity<List<MonthlyCountDTO>> getMetricsOffer() {
        List<MonthlyCountDTO> offers = offerService.getMetricsOffer();
        return ResponseEntity.ok(offers);
    }

    @GetMapping(value = "/getAll/paginated")
    public ResponseEntity<Page<OfferDTO>> queryAllOffers(@RequestParam String searchTerm,
                                                         @RequestParam List<Long> tagIds,
                                                         @RequestParam int page,
                                                         @RequestParam int size) {
        Page<OfferDTO> offers = offerService.queryAllOffers(searchTerm, tagIds, page, size);
        return ResponseEntity.ok(offers);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PostMapping(value = "/add")
    public ResponseEntity<Integer> addOffer(@RequestBody OfferDTO request, Principal principal) {
        String username = principal.getName();
        int offerId = offerService.insertOffer(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(offerId);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PutMapping(value = "/update")
    public ResponseEntity<Integer> updateOffer(@RequestBody OfferDTO offerDTO, Principal principal) {
        String username = principal.getName();
        int updatedId = offerService.updateOffer(offerDTO, username);
        return ResponseEntity.ok(updatedId);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @DeleteMapping(value = "/delete/{offerId}")
    public ResponseEntity<Integer> deleteOffer(Principal principal, @PathVariable int offerId) {
        String username = principal.getName();
        int deletedId = offerService.deleteOffer(offerId, username);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(deletedId);
    }

    @PreAuthorize("hasRole('ROLE_CANDIDATE')")
    @PostMapping(value = "/apply")
    public ResponseEntity<String> applyForOffer(@RequestParam int offerId, Principal principal) {
        String username = principal.getName();
        int appliedOfferId;
        appliedOfferId = offerService.userApplyOffer(offerId, username);
        if (appliedOfferId > 0) {
            return ResponseEntity.ok("Aplicado correctamente a la oferta");
        } else {
            return ResponseEntity.badRequest().body("Ya has aplicado a esta oferta.");
        }
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping(value = "/companyOffers")
    public ResponseEntity<List<OfferDTO>> queryCompanyOffers(Principal principal) {
        List<OfferDTO> offers = offerService.getCompanyOffers(principal.getName());
        return ResponseEntity.ok(offers);
    }


    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PostMapping(value = "/update/{OfferID}")
    public ResponseEntity<String> updateValidUser(
            @PathVariable("OfferID") int offerID,
            @RequestBody CandidateDTO candidateDTO) {
        if (offerID <= 0) {
            return ResponseEntity.badRequest().body(null);
        }
        if (candidateDTO.getLogin() == null) {
            return ResponseEntity.badRequest().body("Invalid candidate data");
        }
        offerService.updateCandidateValidity(offerID, candidateDTO);
        return ResponseEntity.ok("Candidato actualizado correctamente");
    }

    @PostMapping("/bookmark/{offerId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<String> addBookmark(@PathVariable int offerId, Principal principal) {
        User user = userDao.findByLogin(principal.getName());
        if (user == null) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        Offer offer = offerDao.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));

        if (candidateBookmarksDao.existsByUserIdAndOfferId(user.getId(), offerId)) {
            return ResponseEntity.badRequest().body("Esta oferta ya está guardada");
        }

        CandidateBookmarks bookmark = new CandidateBookmarks(user, offer);
        candidateBookmarksDao.save(bookmark);

        return ResponseEntity.ok("Oferta guardada correctamente");
    }

    @DeleteMapping("/bookmark/{offerId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<String> removeBookmark(@PathVariable int offerId, Principal principal) {
        User user = userDao.findByLogin(principal.getName());
        if (user == null) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        candidateBookmarksDao.deleteByUserIdAndOfferId(user.getId(), offerId);
        return ResponseEntity.ok("Oferta eliminada de guardados");
    }

    @PreAuthorize("hasRole('ROLE_CANDIDATE') or hasRole('ROLE_ADMIN')")
    @GetMapping(value = "/count/candidate")
    public ResponseEntity<Integer> getOffersCount(@RequestParam String listType,
                                                  Principal principal) {
        Integer offersCount = offerService.getCadidateOffersCount(listType, principal.getName());
        return ResponseEntity.ok(offersCount);
    }

    @PreAuthorize("hasRole('ROLE_CANDIDATE')")
    @GetMapping(value = "/candidate")
    public ResponseEntity<Page<OfferDTO>> searchOffers(@RequestParam String searchTerm,
                                                       @RequestParam List<Long> tagIds,
                                                       @RequestParam String listType,
                                                       @RequestParam int page,
                                                       @RequestParam int size,
                                                       Principal principal) {
        Page<OfferDTO> offers = offerService.getCandidateOffersPaginated(listType, principal.getName(), searchTerm, tagIds, page, size);
        return ResponseEntity.ok(offers);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping(value = "/count/company")
    public ResponseEntity<Integer> getCompanyOffersCount(@RequestParam String status,
                                                         Principal principal) {
        Integer offersCount = offerService.getCompanyOffersCount(status, principal.getName());
        return ResponseEntity.ok(offersCount);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping(value = "/company")
    public ResponseEntity<Page<OfferDTO>> getCompanyOffers(@RequestParam String status,
                                                           @RequestParam String searchTerm,
                                                           @RequestParam List<Long> tagIds,
                                                           @RequestParam int page,
                                                           @RequestParam int size,
                                                           Principal principal) {
        return ResponseEntity
                .ok(offerService.getCompanyOffersByStatusPaginated(principal.getName(), status, searchTerm, tagIds, page, size));
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PutMapping(value = "/status/{offerId}")
    public ResponseEntity<String> updateOfferStatus(@PathVariable int offerId,
                                                    @RequestParam String status,
                                                    Principal principal) {
        return ResponseEntity.ok(offerService.updateOfferStatus(offerId, status, principal.getName())
                ? "Estado de la oferta actualizado correctamente"
                : "Error al actualizar el estado de la oferta");
    }

    @GetMapping("/metrics/monthly-closed-offers")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_COMPANY')")
    public ResponseEntity<List<MonthlyCountDTO>> getMonthlyClosedOffersWithAcceptedCandidates() {
        List<MonthlyCountDTO> metrics = offerService.getMonthlyClosedOffersWithAcceptedCandidates();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/searchable")
    public ResponseEntity<List<OfferDTO>> getSearchableOffers(Principal principal) {
        List<OfferDTO> offers = offerService.getSearchableOffers(principal.getName());
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/company/average-hiring-time")
    public ResponseEntity<Double> getAverageHiringTime(Principal principal) {
        User user = userDao.findByLogin(principal.getName());
        if (user == null) {
            return ResponseEntity.badRequest().body(null);
        }
        // Buscar la empresa asociada al usuario
        Company company = companyDao.findCompanyByUser(user);
        if (company == null) {
            return ResponseEntity.badRequest().body(null);
        }
        Double avg = offerService.getAverageHiringTimeByCompanyId(company.getId());
        return ResponseEntity.ok(avg);
    }
}