package com.campusdual.bfp.model.dto;

import java.time.LocalDate;

public class CandidateEducationDTO {

    private Long id;
    private Long candidateId;
    private String institution;
    private String degree;
    private LocalDate startDate;
    private LocalDate endDate;

    // Getters y setters

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Long getCandidateId() {
        return candidateId;
    }
    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
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

    // Constructores

    public CandidateEducationDTO() {
    }

    public CandidateEducationDTO(Long id, Long candidateId, String institution, String degree, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.candidateId = candidateId;
        this.institution = institution;
        this.degree = degree;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}