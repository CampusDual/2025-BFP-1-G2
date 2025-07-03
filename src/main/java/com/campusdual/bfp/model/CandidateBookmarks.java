package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "candidate_bookmarks")
public class CandidateBookmarks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    public CandidateBookmarks() {
    }

    public CandidateBookmarks(User user, Offer offer) {
        this.user = user;
        this.offer = offer;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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