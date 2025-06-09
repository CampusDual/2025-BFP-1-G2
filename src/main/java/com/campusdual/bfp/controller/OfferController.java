package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/offer")
public class OfferController {

    @Autowired
    private IOfferService offerService;

    @GetMapping
    public String testController() {
        return "Offers controller works!";
    }
    @PostMapping
    public String testController(@RequestBody String name) {
        return "Offers controller works, " + name +"!";
    }
    @GetMapping(value = "/testMethod")
    public String testControllerMethod() { return "Offers controller method works!"; }
    @PostMapping(value = "/get")
    public OfferDTO queryOffer(@RequestBody OfferDTO OfferDTO) { return offerService.queryOffer (OfferDTO); }
    @GetMapping (value = "/getAll")
    public List<OfferDTO> queryAllOffers() { return offerService.queryAllOffers(); }
    @PostMapping(value = "/add")
    public int addOffer(@RequestBody OfferDTO request, Principal principal) {
        // Suponiendo que el nombre de usuario es el email o username
        String username = principal.getName();
        return offerService.insertOffer(request, username);
    }
    @PutMapping(value = "/update")
    public int updateOffer(@RequestBody OfferDTO OfferDTO) { return offerService.updateOffer(OfferDTO); }
    @DeleteMapping(value = "/delete")
    public int deleteOffer(@RequestBody OfferDTO OfferDTO) { return offerService.deleteOffer(OfferDTO); }


}
