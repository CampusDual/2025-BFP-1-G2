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

    //@Column(name = "company", nullable = false)

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "date_added", nullable = false)
    private Date date;

    public Offer() {
    }

    public Offer(int id, String title, String description, boolean active, Date date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.active = active;
        this.date = date;
    }
    public Offer(String title, String description, boolean active, Date date) {
        this.title = title;
        this.description = description;
        this.active = active;
        this.date = date;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
