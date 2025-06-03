package com.campusdual.bfp;

import com.campusdual.bfp.controller.OfferController;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.service.OfferService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class OffersControllerTest {

    private MockMvc mockMvc;
    @InjectMocks
    OfferController OffersController;

    @Mock
    OfferService OfferService;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(OffersController)
                .build();
    }

    @Test
    void addOfferTest() throws Exception {
        // prepare stub
        when(this.OfferService.insertOffer(any(OfferDTO.class))).thenReturn(1);
        // build DTO
        OfferDTO dto = new OfferDTO();
        dto.setTitle("Titulo");
        dto.setDescription("Descripcion");
        dto.setActive(true);
        dto.setDate(new java.util.Date());

        MvcResult mvcResult = mockMvc.perform(
                MockMvcRequestBuilders.post("/offer/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(dto)))
                .andReturn();

        assertEquals(200, mvcResult.getResponse().getStatus());
        assertEquals("1", mvcResult.getResponse().getContentAsString());
        verify(this.OfferService, times(1)).insertOffer(any(OfferDTO.class));
    }

    @Test
    void getAllOffersTest() throws Exception {
        List<OfferDTO> OffersList = new ArrayList<>();
        OffersList.add(new OfferDTO());
        OffersList.add(new OfferDTO());
        OffersList.add(new OfferDTO());

        when(this.OfferService.queryAllOffers()).thenReturn(OffersList);

        MvcResult mvcResult = mockMvc.perform(
                MockMvcRequestBuilders.get("/offer/getAll")
                        .accept(MediaType.APPLICATION_JSON))
                .andReturn();

        assertEquals(200, mvcResult.getResponse().getStatus());
        List<?> result = new ObjectMapper().readValue(mvcResult.getResponse().getContentAsString(), List.class);
        assertEquals(3, result.size());
        verify(this.OfferService, times(1)).queryAllOffers();
    }

}
