package com.campusdual.bfp.model.dto;


import java.util.Date;

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
    private String profilePictureUrl;
    private String curriculumUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String figmaUrl;
    private String personalWebsiteUrl;
    private String[] allDates;

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

    public String getLogin() {
        return super.getLogin();
    }

    public void setLogin(String login) {
        super.setLogin(login);
    }

    public String getPassword() {
        return super.getPassword();
    }

    public void setPassword(String password) {
        super.setPassword(password);
    }


    public Boolean isValid() {
        return valid;
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
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
    public String getCurriculumUrl() {
        return curriculumUrl;
    }
    public void setCurriculumUrl(String curriculumUrl) {
        this.curriculumUrl = curriculumUrl;
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
}