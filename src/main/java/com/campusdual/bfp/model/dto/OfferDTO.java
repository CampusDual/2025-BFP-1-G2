package com.campusdual.bfp.model.dto;


import java.util.Comparator;
import java.util.Date;

public class OfferDTO implements Comparator <OfferDTO> {
    private int id;
    private String title;
    private String description;
    private String companyName;
    private String email;
    private Date dateAdded;

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

    @Override
    public int compare(OfferDTO o1, OfferDTO o2) {
        if (o1.getDateAdded() == null || o2.getDateAdded() == null) {
            return 0;
        }
        return o1.getDateAdded().compareTo(o2.getDateAdded());
    }
}
