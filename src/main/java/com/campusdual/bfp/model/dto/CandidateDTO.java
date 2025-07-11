package com.campusdual.bfp.model.dto;

import java.util.List;

public class CandidateDTO extends SignupDTO {

    private String phoneNumber;
    private String name;
    private String surname1;
    private String surname2;
    private Boolean valid;
    private String dateAdded;
    private String location;
    private String professionalTitle;
    private String yearsOfExperience;
    private String educationLevel;
    private String languages;
    private String employmentStatus;
    private String linkedinUrl;
    private String githubUrl;
    private String figmaUrl;
    private String personalWebsiteUrl;
    private String cvPdfBase64;
    private String logoImageBase64;
    private String[] allDates;
    private int[] tagIds;
    private List<CandidateExperienceDTO> experiences;
    private List<CandidateEducationDTO> educations;

    public String[] getAllDates() {
        return allDates;
    }

    public void setAllDates(String[] allDates) {
        this.allDates = allDates;
    }

    public Boolean getValid() {
        return valid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getSurname1() {
        return surname1;
    }

    public void setSurname1(String surname1) {
        this.surname1 = surname1;
    }

    public String getSurname2() {
        return surname2;
    }

    public void setSurname2(String surname2) {
        this.surname2 = surname2;
    }

    public void setValid(Boolean valid) {
        this.valid = valid;
    }

    public void setDateAdded(String date) {
        this.dateAdded = date;
    }
    public String getDateAdded() {
        return dateAdded;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public String getProfessionalTitle() {
        return professionalTitle;
    }
    public void setProfessionalTitle(String professionalTitle) {
        this.professionalTitle = professionalTitle;
    }
    public String getYearsOfExperience() {
        return yearsOfExperience;
    }
    public void setYearsOfExperience(String yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
    public String getEducationLevel() {
        return educationLevel;
    }
    public void setEducationLevel(String educationLevel) {
        this.educationLevel = educationLevel;
    }
    public String getLanguages() {
        return languages;
    }
    public void setLanguages(String languages) {
        this.languages = languages;
    }
    public String getEmploymentStatus() {
        return employmentStatus;
    }
    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }
    public String getLinkedinUrl() {
        return linkedinUrl;
    }
    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
    public String getGithubUrl() {
        return githubUrl;
    }
    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }
    public String getFigmaUrl() {
        return figmaUrl;
    }
    public void setFigmaUrl(String figmaUrl) {
        this.figmaUrl = figmaUrl;
    }
    public String getPersonalWebsiteUrl() {
        return personalWebsiteUrl;
    }
    public void setPersonalWebsiteUrl(String personalWebsiteUrl) {
        this.personalWebsiteUrl = personalWebsiteUrl;
    }

    public String getCvPdfBase64() {
        return cvPdfBase64;
    }

    public void setCvPdfBase64(String cvPdfBase64) {
        this.cvPdfBase64 = cvPdfBase64;
    }

    public String getLogoImageBase64() {
        return logoImageBase64;
    }

    public void setLogoImageBase64(String logoImageBase64) {
        this.logoImageBase64 = logoImageBase64;
    }

    public int[] getTagIds() {
        return tagIds;
    }

    public void setTagIds(int[] tagIds) {
        this.tagIds = tagIds;
    }

    public List<CandidateExperienceDTO> getExperiences() {
        return experiences;
    }

    public void setExperiences(List<CandidateExperienceDTO> experiences) {
        this.experiences = experiences;
    }

    public List<CandidateEducationDTO> getEducations() {
        return educations;
    }

    public void setEducations(List<CandidateEducationDTO> educations) {
        this.educations = educations;
    }
}