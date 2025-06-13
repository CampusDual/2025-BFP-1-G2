package com.campusdual.bfp.model;
import javax.persistence.*;

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

    public UserOffer(){

    }

    public UserOffer(long id, User user, Offer offer) {
        this.id = id;
        this.user = user;
        this.offer = offer;
    }

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
}
