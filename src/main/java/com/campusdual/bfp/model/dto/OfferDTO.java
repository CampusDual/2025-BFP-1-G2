package com.campusdual.bfp.model.dto;


import com.campusdual.bfp.model.Company;

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
    private CompanyDTO company;
    public Boolean active;
    private Boolean isBookmarked;
    private List<CandidateDTO> candidates;
    private boolean isApplied;


    public OfferDTO() {
    }



    public List<CandidateDTO> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<CandidateDTO> candidates) {
        this.candidates = candidates;
    }

    public Boolean getBookmarked() {
        return isBookmarked;
    }

    public void setBookmarked(Boolean bookmarked) {
        isBookmarked = bookmarked;
    }
    public String getStatus() {
        if (active == null) return "DRAFT";
        if (active) return "ACTIVE";
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

    public CompanyDTO getCompany() {
        return company;
    }

    public void setCompany(CompanyDTO company) {
        this.company = company;
    }

    public void setIsApplied(boolean isApplied) {
        this.isApplied = isApplied;
    }

    public boolean isApplied() {
        return isApplied;
    }
}
