package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.Offer;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dao.OfferDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dto.OfferDTO;
import com.campusdual.bfp.model.dto.dtomapper.OfferMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfferService implements IOfferService {

    @Autowired
    private OfferDao OfferDao;

    @Autowired
    private UserDao userDao;

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
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");

        Offer offer = new Offer();
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setActive(true);
        offer.setDate(new Date());
        // Asigna el id de la empresa/usuario
        offer.setCompanyId(user.getId());

        offerDao.save(offer);
        return offer.getId();
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