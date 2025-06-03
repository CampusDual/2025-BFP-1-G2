package com.campusdual.bfp.controller;

import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.SignupDTO;
import com.campusdual.bfp.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserService userService;
    @Mock
    private JWTUtil jwtUtils;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }


    @Test
    void signIn_malformedHeader() throws Exception {
        String invalid = Base64.getEncoder().encodeToString("userpass".getBytes(StandardCharsets.UTF_8));
        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/signin")
                        .header(HttpHeaders.AUTHORIZATION, "Basic " + invalid)
        )
        .andExpect(status().isBadRequest())
        .andReturn();
        assertEquals("Malformed auth header", result.getResponse().getContentAsString());
    }

    @Test
    void signIn_badCredentials() throws Exception {
        String creds = Base64.getEncoder().encodeToString("user:wrong".getBytes(StandardCharsets.UTF_8));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad creds"));

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/signin")
                        .header(HttpHeaders.AUTHORIZATION, "Basic " + creds)
        )
        .andExpect(status().isUnauthorized())
        .andReturn();
        assertEquals("Bad credentials", result.getResponse().getContentAsString());
    }

    @Test
    void signIn_success() throws Exception {
        String credsRaw = "user:pass";
        String creds = Base64.getEncoder().encodeToString(credsRaw.getBytes(StandardCharsets.UTF_8));
        User userDetails = new User("user", "pass", Collections.emptyList());
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJWTToken("user")).thenReturn("token123");

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/signin")
                        .header(HttpHeaders.AUTHORIZATION, "Basic " + creds)
        )
        .andExpect(status().isOk())
        .andReturn();
        assertEquals("token123", result.getResponse().getContentAsString());
    }

    @Test
    void signUp_conflict() throws Exception {
        SignupDTO dto = new SignupDTO();
        dto.setLogin("user");
        dto.setPassword("pass");
        when(userService.existsByUsername("user")).thenReturn(true);

        String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(dto);
        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
        )
        .andExpect(status().isConflict())
        .andReturn();
        assertEquals("User already exists.", result.getResponse().getContentAsString());
    }

    @Test
    void signUp_success() throws Exception {
        SignupDTO dto = new SignupDTO();
        dto.setLogin("newuser");
        dto.setPassword("newpass");
        when(userService.existsByUsername("newuser")).thenReturn(false);

        String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(dto);
        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
        )
        .andExpect(status().isCreated())
        .andReturn();
        assertEquals("User successfully registered.", result.getResponse().getContentAsString());
        verify(userService, times(1)).registerNewUser("newuser", "newpass");
    }
}
