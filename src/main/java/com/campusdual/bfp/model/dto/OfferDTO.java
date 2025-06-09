package com.campusdual.bfp.model.dto;


import java.util.Date;

public class OfferDTO {
    private int id;
    private String title;
    private String description;
    private String companyName;
    private String email;
    private Date dateAdded;
    // Getters y setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(Date dateAdded) {
        this.dateAdded = dateAdded;
    }
}
