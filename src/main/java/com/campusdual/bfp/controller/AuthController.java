package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IUserService;
import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    IUserService userService;
    @Autowired
    JWTUtil jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<String> authenticateUser(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.toLowerCase().startsWith("basic ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Header auth is missing.");
        }

        String base64Credentials = authHeader.substring("Basic ".length());
        byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
        String credentials = new String(credDecoded, StandardCharsets.UTF_8);

        final String[] values = credentials.split(":", 2);
        if (values.length != 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Malformed auth header");
        }

        try {
            Authentication authentication = this.authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(values[0], values[1])
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = this.jwtUtils.generateJWTToken(userDetails.getUsername());

            userService.addRoleToUser(15, (long) 6);

            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_USER");

            return ResponseEntity.ok(token);

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bad credentials");
        }
    }

    @PostMapping("/signup/company")
    public ResponseEntity<String> registerUser(@RequestBody SignupDTO request) {
        if (this.userService.existsByUsername(request.getLogin())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists.");
        }
        this.userService.registerNewUser(request.getLogin(), request.getPassword(), request.getEmail(), "ROLE_COMPANY");
        return ResponseEntity.status(HttpStatus.CREATED).body("User successfully registered.");
    }

    @PostMapping("/signup")
    public ResponseEntity<String> registerCandidate(@RequestBody CandidateDTO request) {
        if (this.userService.existsByUsername(request.getLogin())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists.");
        }
        this.userService.registerNewCandidate(request.getLogin(), request.getPassword(), request.getEmail(),
                request.getName(), request.getSurname1(), request.getSurname2(), request.getPhoneNumber(), "ROLE_CANDIDATE",
                request.getLocation(), request.getProfessionalTitle(), request.getYearsOfExperience(), request.getEducationLevel(),
                request.getLanguages(), request.getEmploymentStatus(),
                request.getLinkedinUrl(), request.getGithubUrl(), request.getFigmaUrl(), request.getPersonalWebsiteUrl(), request.getTagIds());
        return ResponseEntity.status(HttpStatus.CREATED).body("User successfully registered.");
    }

    @GetMapping("/me")
    public UserDetails getCurrentUser(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        if (username == null) {
            return null; // or throw an exception
        }
        return userService.loadUserByUsername(username);
    }

    @GetMapping("/me/username")
    public String getCurrentUsername(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return "Token no proporcionado.";
        }
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        if (username == null) {
            return "Token inválido.";
        }
        return username;
    }

    @GetMapping("/user/roles")
    public List<String> getUserRoles(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return List.of("No roles available");
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    @GetMapping("/candidateDetails")
    public ResponseEntity<CandidateDTO> getCandidateDetails(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CandidateDTO candidateDetails = userService.getCandidateDetails(username);
        if (candidateDetails == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(candidateDetails);
    }

    @PutMapping("/candidateDetails/edit")
    public ResponseEntity<CandidateDTO> editCandidateDetails(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
                                                             @RequestBody CandidateDTO candidateDTO) {
        if (candidateDTO == null) {
            return ResponseEntity.badRequest().body(null);
        }
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CandidateDTO updatedCandidate = userService.updateCandidateDetails(username, candidateDTO);
        if (updatedCandidate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(updatedCandidate);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/listCandidates")
    public ResponseEntity<List<CandidateDTO>> listCandidates(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<CandidateDTO> candidatos = userService.getAllCandidates();
        return ResponseEntity.ok(candidatos);
    }
}