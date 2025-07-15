package com.campusdual.bfp.model;
import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "user_offers")
public class UserOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="offer_id")
    private Offer offer;

    @Column
    private Date date;

    @Column
    private Boolean valid;

    @Column(name="validation_date")
    private Date validationDate;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Offer getOffer() {
        return offer;
    }

    public void setOffer(Offer offer) {
        this.offer = offer;
    }
    public Date getDate() {
        return date;
    }
    public void setDate(Date date) {
        this.date = date;
    }
    public Boolean isValid() { return valid; }
    public void setValid(Boolean valid) { this.valid = valid; }
    public Date getValidationDate() {
        return validationDate;
    }
    public void setValidationDate(Date validationDate) {
        this.validationDate = validationDate;
    }
}
