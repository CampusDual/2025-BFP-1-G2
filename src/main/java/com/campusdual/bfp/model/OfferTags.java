package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "offer_tags")
public class OfferTags {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    public OfferTags() {}

    public OfferTags(Offer offer, Tag tag) {
        this.offer = offer;
        this.tag = tag;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Offer getOffer() { return offer; }
    public void setOffer(Offer offer) { this.offer = offer; }

    public Tag getTag() { return tag; }
    public void setTag(Tag tag) { this.tag = tag; }
}