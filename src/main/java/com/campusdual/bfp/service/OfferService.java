package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfferService implements IOfferService {

    @Autowired
    private OfferDao OfferDao;

    @Override
    public OfferDTO queryOffer(OfferDTO OfferDTO) {
        Offer Offer = OfferMapper.INSTANCE.toEntity (OfferDTO);
        return OfferMapper.INSTANCE.toDTO(OfferDao.getReferenceById(Offer.getId()));
    }
    @Override
    public List<OfferDTO> queryAllOffers() {
        return OfferMapper.INSTANCE.toDTOList(OfferDao.findAll());
    }
    @Override
    public int insertOffer(OfferDTO OfferDTO) {
        Offer Offer = OfferMapper. INSTANCE.toEntity(OfferDTO);
        OfferDao.saveAndFlush(Offer);
        return Offer.getId();
    }
    @Override
    public int updateOffer(OfferDTO OfferDTO) {
        return insertOffer(OfferDTO);
    }
    @Override
    public int deleteOffer(OfferDTO OfferDTO) {
        int id = OfferDTO.getId();
        Offer Offer = OfferMapper.INSTANCE.toEntity(OfferDTO);
        OfferDao.delete(Offer);
        return id;
    }
}