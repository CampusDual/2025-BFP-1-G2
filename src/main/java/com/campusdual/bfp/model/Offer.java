package com.campusdual.bfp.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "offers")
public class Offer {
    @Id
    @GeneratedValue  (strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "id")
    private Company company;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "date_added", nullable = false)
    private Date dateAdded;

    public Offer() {
    }

    public Offer(int id, String title, String description, Boolean active, Date date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.active = active;
        this.dateAdded = date;
    }

    public Offer(String title, String description, Boolean active, Date date) {
        this.title = title;
        this.description = description;
        this.active = active;
        this.dateAdded = date;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Date getDate() {
        return dateAdded;
    }

    public void setDate(Date date) {
        this.dateAdded = date;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public int getCompanyId() {
        return company != null ? company.getId() : 0;
    }

    public void setCompanyId(int companyId) {
        if (this.company == null) {
            this.company = new Company();
        }
        this.company.setId(companyId);
    }

    public boolean isDraft() {
        return active == null;
    }

    public boolean isPublished() {
        return Boolean.TRUE.equals(active);
    }

    public boolean isArchived() {
        return Boolean.FALSE.equals(active);
    }
}
