package com.campusdual.bfp.model;


import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "candidate_education")
public class CandidateEducation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false, length = 255)
    private String institution;

    @Column(nullable = false, length = 255)
    private String degree;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // Getters y setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Candidate getCandidate() {
        return candidate;
    }
    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }
    public String getInstitution() {
        return institution;
    }
    public void setInstitution(String institution) {
        this.institution = institution;
    }
    public String getDegree() {
        return degree;
    }
    public void setDegree(String degree) {
        this.degree = degree;
    }
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public LocalDate getEndDate() {
        return endDate;
    }
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public CandidateEducation() {
    }

    public CandidateEducation(Candidate candidate, String institution, String degree, LocalDate startDate, LocalDate endDate) {
        this.candidate = candidate;
        this.institution = institution;
        this.degree = degree;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
