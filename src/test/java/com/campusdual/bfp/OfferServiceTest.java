package com.campusdual.bfp;

import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import com.campusdual.bfp.service.OfferService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    OfferDao OfferDao;

    @InjectMocks
    OfferService OfferService;

    @Test
    void getAllOffersTest() {
        List<Offer> OffersList = new ArrayList<Offer>();


        Offer OfferOne = new Offer ();
        Offer OfferTwo = new Offer ();
        Offer OfferThree = new Offer ();

        OffersList.add(OfferOne);
        OffersList.add(OfferTwo);
        OffersList.add(OfferThree);

        when(this.OfferDao.findAll()).thenReturn(OffersList);

        List<OfferDTO> empList = this.OfferService.queryAllOffers();

        verify(this.OfferDao, times(1)).findAll();
        assertEquals(3, empList.size());
    }

    @Test
    void getOneOfferTest() {
        Offer Offer = new Offer();
        Offer.setId(1);

        when(this.OfferDao.getReferenceById(1)).thenReturn(Offer);

        OfferDTO OfferDTO = new OfferDTO();
        OfferDTO.setId(1);

        OfferDTO OfferResult = this.OfferService.queryOffer(OfferDTO);

        assertNotNull(OfferResult);
    }

    @Test
    void OfferNotPresentInDb() {
        when(this.OfferDao.getReferenceById(1)).thenReturn(null);

        OfferDTO OfferDTO = new OfferDTO();
        OfferDTO.setId(1);

        assertNull(this.OfferService.queryOffer(OfferDTO));

    }

    @Test
    void deleteOfferTest() {
        Offer Offer = new Offer();
        Offer.setId(1);
        Offer.setTitle("Titulo");
        Offer.setDescription("Description");
        Offer.setActive(true);
        Offer.setDate(Date.valueOf("2022-01-01"));

        OfferDTO editOfferDTO = OfferMapper.INSTANCE.toDTO(Offer);

        Integer deleteOfferId = this.OfferService.deleteOffer(editOfferDTO);

        assertNotNull(deleteOfferId);
    }
}
