package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.ICompanyService;
import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.CompanyDTO;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired
    private ICompanyService companyService;

    @Autowired
    private JWTUtil jwtUtils;

    @GetMapping("/getAll")
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        try {
            List<CompanyDTO> companies = companyService.getAllCompanies();
            return new ResponseEntity<>(companies, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Integer id) {
        try {
            Optional<CompanyDTO> company = companyService.getCompanyById(id);
            return company.map(companyDTO -> new ResponseEntity<>(companyDTO, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(null, HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/byName/{name}")
    public ResponseEntity<CompanyDTO> getCompanyByName(@PathVariable String name) {
        try {
            CompanyDTO company = companyService.getCompanyByName(name);
            if (company != null) {
                return new ResponseEntity<>(company, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<CompanyDTO> createCompany(@RequestBody CompanyDTO company) {
        try {
            CompanyDTO newCompany = companyService.createCompany(company);
            return new ResponseEntity<>(newCompany, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_COMPANY')")
    @PutMapping("/update")
    public ResponseEntity<CompanyDTO> updateCompany(@RequestBody CompanyDTO company, Principal principal) {
        CompanyDTO updatedCompany = companyService.updateCompany(company, principal.getName());
        return new ResponseEntity<>(updatedCompany, HttpStatus.OK);

    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCompany(@PathVariable Integer id) {
        try {
            companyService.deleteCompany(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/search")
    public ResponseEntity<List<CompanyDTO>> searchCompanies(@RequestParam String term) {
        try {
            List<CompanyDTO> companies = companyService.searchCompanies(term);
            return new ResponseEntity<>(companies, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping("/{companyId}/offers")
    public ResponseEntity<List<OfferDTO>> getCompanyOffers(@PathVariable Integer companyId) {
        try {
            List<OfferDTO> offers = companyService.getCompanyOffers(companyId);
            return new ResponseEntity<>(offers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/byLocation")
    public ResponseEntity<List<CompanyDTO>> getCompaniesByLocation(@RequestParam String location) {
        try {
            List<CompanyDTO> companies = companyService.getCompaniesByLocation(location);
            return new ResponseEntity<>(companies, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping("/myCompany")
    public ResponseEntity<CompanyDTO> getMyCompany(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<CompanyDTO> company = companyService.getCompanyByUsername(username);
        return company.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping("/offers/status")
    public ResponseEntity<List<OfferDTO>> getOffersByStatus(@RequestParam String status, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        List<OfferDTO> offers = companyService.getCompanyOffersByStatus(username, status);
        return ResponseEntity.ok(offers);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PutMapping("/offers/publish/{id}")
    public ResponseEntity<Void> publishOffer(@PathVariable int id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        companyService.publishOffer(id, username);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PutMapping("/offers/archive/{id}")
    public ResponseEntity<Void> archiveOffer(@PathVariable int id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        companyService.archiveOffer(id, username);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PutMapping("/offers/draft/{id}")
    public ResponseEntity<Void> draftOffer(@PathVariable int id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        companyService.draftOffer(id, username);
        return ResponseEntity.ok().build();
    }
}
