package com.campusdual.bfp.model.dto;

import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.service.UserService;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class OfferDTO {
    private String title;
    private String description;

    // Getters y setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
