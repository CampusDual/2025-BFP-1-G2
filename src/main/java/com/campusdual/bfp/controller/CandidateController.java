package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IUserService;
import com.campusdual.bfp.model.dto.CandidateDTO;
import com.campusdual.bfp.model.dto.CandidateEducationDTO;
import com.campusdual.bfp.model.dto.CandidateExperienceDTO;
import com.campusdual.bfp.model.dto.MonthlyCountDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/candidate")
public class CandidateController {

    @Autowired
    IUserService userService;

    @GetMapping("/me")
    public ResponseEntity<CandidateDTO> getCandidateDetails(Principal principal) {
        CandidateDTO candidateDetails = userService.getCandidateDetails(principal.getName());
        if (candidateDetails == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(candidateDetails);
    }

    @GetMapping("/get/{username}")
    public ResponseEntity<CandidateDTO> getSpecificCandidateDetails(@PathVariable String username) {
        CandidateDTO candidateDetails = userService.getCandidateDetails(username);
        if (candidateDetails == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(candidateDetails);
    }

    @PutMapping("/edit")
    public ResponseEntity<CandidateDTO> editCandidateDetails(Principal principal,
                                                             @RequestBody CandidateDTO candidateDTO) {
        if (candidateDTO == null) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(userService.updateCandidateDetails(principal.getName(), candidateDTO));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/list")
    public ResponseEntity<List<MonthlyCountDTO>> listCandidates() {
        List<MonthlyCountDTO> candidatos = userService.getAllCandidates();
        return ResponseEntity.ok(candidatos);
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Integer> deleteExperience(Principal principal,
                                                 @PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteCandidateExperience(id, principal.getName()));
    }

    @PostMapping("/experience")
    public ResponseEntity<CandidateExperienceDTO> createExperience(
            Principal principal,
            @RequestBody CandidateExperienceDTO experienceDTO) {
        CandidateExperienceDTO created = userService.createCandidateExperience(principal.getName(), experienceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Integer> deleteEducation(Principal principal,
                                                   @PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteCandidateEducation(id, principal.getName()));
    }

    @PostMapping("/education")
    public ResponseEntity<CandidateEducationDTO> createEducation(
            Principal principal,
            @RequestBody CandidateEducationDTO educationDTO) {
        CandidateEducationDTO created = userService.createCandidateEducation(principal.getName(), educationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping("/myOffers/{offerId}")
    public ResponseEntity<Page<CandidateDTO>> getCandidatesFromMyOffers(
            @PathVariable Integer offerId,
            @RequestParam int page,
            @RequestParam int size) {
        Page<CandidateDTO> candidates = userService.getCandidatesFromMyOffers(offerId, page, size);
        return ResponseEntity.ok(candidates);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @GetMapping("/recommended/myOffers/{offerId}")
    public ResponseEntity<Page<CandidateDTO>> getRecomendeCandidatesFromMyOffer(
            @PathVariable Integer offerId,
            @RequestParam int page,
            @RequestParam int size) {
        Page<CandidateDTO> candidates = userService.getRecomendedCandidatesFromMyOffer(offerId, page, size);
        return ResponseEntity.ok(candidates);
    }
}
