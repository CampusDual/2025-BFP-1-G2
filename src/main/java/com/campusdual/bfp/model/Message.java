package com.campusdual.bfp.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "messages")
public class Message{
    public enum Sender {
        Company, Candidate
    }

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", referencedColumnName = "id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", referencedColumnName = "id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private Sender sender;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "date_message", nullable = false)
    private Date dateMessage;

    public Message() {
    }
    public Message(Company company, Candidate candidate, Sender sender, String message, Date dateMessage) {
        this.company = company;
        this.candidate = candidate;
        this.sender = sender;
        this.message = message;
        this.dateMessage = dateMessage;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
    public Company getCompany() {
        return company;
    }
    public void setCompany(Company company) {
        this.company = company;
    }
    public Candidate getCandidate() {
        return candidate;
    }
    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }
    public Sender getSender() {
        return sender;
    }
    public void setSender(Sender sender) {
        this.sender = sender;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public Date getDateMessage() {
        return dateMessage;
    }
    public void setDateMessage(Date dateMessage) {
        this.dateMessage = dateMessage;
    }
}
