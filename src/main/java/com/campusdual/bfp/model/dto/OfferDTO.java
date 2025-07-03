package com.campusdual.bfp.model.dto;


import com.campusdual.bfp.model.Company;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Comparator;
import java.util.Date;
import java.util.List;

public class OfferDTO implements Comparator <OfferDTO> {
    private int id;
    private String title;
    private String description;
    private String companyName;
    private String email;
    private Date dateAdded;
    private List<TagDTO> tags;
    private String logo;
    private Company company;
    public Boolean active;

    @JsonProperty("status")
    public String getStatus() {
        if (active == null) return "DRAFT";
        if (Boolean.TRUE.equals(active)) return "ACTIVE";
        return "ARCHIVED";
    }

    public Boolean getCandidateValid() {
        return candidateValid;
    }

    public void setCandidateValid(Boolean candidateValid) {
        this.candidateValid = candidateValid;
    }

    private Boolean candidateValid;

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

    public List<TagDTO> getTags() { return tags; }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }
    public void setTags(List<TagDTO> tags) { this.tags = tags; }
    @Override
    public int compare(OfferDTO o1, OfferDTO o2) {
        if (o1.getDateAdded() == null || o2.getDateAdded() == null) {
            return 0;
        }
        return o1.getDateAdded().compareTo(o2.getDateAdded());
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}
