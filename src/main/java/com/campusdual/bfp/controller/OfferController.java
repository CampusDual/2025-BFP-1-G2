package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/offer")
public class OfferController {

    @Autowired
    private IOfferService offerService;

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

    @PostMapping(value = "/get")
    public ResponseEntity<OfferDTO> queryOffer(@RequestBody OfferDTO offerDTO) {
        OfferDTO result = offerService.queryOffer(offerDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/getAll")
    public ResponseEntity<List<OfferDTO>> queryAllOffers() {
        List<OfferDTO> offers = offerService.queryAllOffers();
        return ResponseEntity.ok(offers);
    }

    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping(value = "/add")
    public ResponseEntity<Integer> addOffer(@RequestBody OfferDTO request, Principal principal) {
        String username = principal.getName();
        int offerId = offerService.insertOffer(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(offerId);
    }

    @PutMapping(value = "/update")
    public ResponseEntity<Integer> updateOffer(@RequestBody OfferDTO offerDTO, Principal principal) {
        String username = principal.getName();
        int updatedId = offerService.updateOffer(offerDTO, username);
        return ResponseEntity.ok(updatedId);
    }

    @DeleteMapping(value = "/delete")
    public ResponseEntity<Integer> deleteOffer(@RequestBody OfferDTO offerDTO, Principal principal) {
        String username = principal.getName();
        int deletedId = offerService.deleteOffer(offerDTO, username);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(deletedId);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping(value = "/apply")
    public ResponseEntity<String> applyForOffer(@RequestParam int offerId, Principal principal) {
        String username = principal.getName();
        int appliedOfferId;
        try {
            appliedOfferId = offerService.userApplyOffer(offerId, username);
            if (appliedOfferId > 0) {
                return ResponseEntity.ok("Aplicado correctamente a la oferta");
            } else {
                return ResponseEntity.badRequest().body("Ya has aplicado a esta oferta.");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Ya has aplicado a esta oferta.");
        }
       
    }
    @PreAuthorize("hasRole('COMPANY')")
    @GetMapping(value="/companyOffers")
    public ResponseEntity<List<OfferDTO>> queryCompanyOffers(Principal principal){
        List<OfferDTO> offers = offerService.getCompanyOffers(principal.getName());
        return ResponseEntity.ok(offers);

    }
}