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

import java.util.*;

@Service
public class OfferService implements IOfferService {

    @Autowired
    private OfferDao OfferDao;

    @Autowired
    private UserDao userDao;

    @Override
    public OfferDTO queryOffer(OfferDTO OfferDTO) {
        Offer Offer = OfferMapper.INSTANCE.toEntity(OfferDTO);
        return OfferMapper.INSTANCE.toDTO(OfferDao.getReferenceById(Offer.getId()));
    }

    @Override
    public List<OfferDTO> queryAllOffers() {
        List<Offer> offers = OfferDao.findAll();
        List<OfferDTO> dtos = new ArrayList<>();
        for (Offer offer : offers) {
            OfferDTO dto = OfferMapper.INSTANCE.toDTO(offer);
            User user = userDao.findUserById(offer.getCompanyId());
            if (user != null) {
                dto.setCompanyName(user.getLogin());
                dto.setEmail(user.getEmail());
            }
            dto.setDateAdded(offer.getDate());
            dtos.add(dto);
        }
        Collections.sort(dtos, new Comparator<OfferDTO>() {
            @Override
            public int compare(OfferDTO o1, OfferDTO o2) {
                return o1.getDateAdded().compareTo(o2.getDateAdded());
            }
        });
        Collections.reverse(dtos);
        return dtos;
    }

    @Override
    public int insertOffer(OfferDTO request, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer offer = new Offer();
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setActive(true);
        offer.setDate(new Date());
        offer.setCompanyId(user.getId());
        Offer savedOffer = OfferDao.saveAndFlush(offer);
        return savedOffer.getId();
    }

    @Override
    public int updateOffer(OfferDTO request, String username) {
        return insertOffer(request, username);
    }

    @Override
    public int deleteOffer(OfferDTO OfferDTO, String username) {
        User user = userDao.findByLogin(username);
        if (user == null) throw new RuntimeException("Usuario no encontrado");
        Offer existingOffer = OfferDao.findById(OfferDTO.getId())
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada con ID: " + OfferDTO.getId()));

        int id = OfferDTO.getId();
        Offer Offer = OfferMapper.INSTANCE.toEntity(OfferDTO);
        OfferDao.delete(Offer);
        return id;
    }
}