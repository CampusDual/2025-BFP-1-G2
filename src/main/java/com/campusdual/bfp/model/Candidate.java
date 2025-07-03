package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column
    private String name;

    @Column
    private String surname1;

    @Column
    private String surname2;

    @Column(name = "location")
    private String location;

    @Column(name = "professional_title")
    private String professionalTitle;

    @Column(name = "years_of_experience")
    private String yearsOfExperience;

    @Column(name = "education_level")
    private String educationLevel;

    @Column(name = "languages", columnDefinition = "TEXT")
    private String languages;

    @Column(name = "employment_status")
    private String employmentStatus;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(name = "curriculum_url", length = 500)
    private String curriculumUrl;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "figma_url", length = 500)
    private String figmaUrl;

    @Column(name = "personal_website_url", length = 500)
    private String personalWebsiteUrl;

    // Nuevos campos para archivos en base64
    @Column(name = "cv_pdf_base64", columnDefinition = "LONGTEXT")
    private String cvPdfBase64;

    @Column(name = "logo_image_base64", columnDefinition = "LONGTEXT")
    private String logoImageBase64;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    public Candidate() {

    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname2() {
        return surname2;
    }

    public void setSurname2(String surname2) {
        this.surname2 = surname2;
    }

    public String getSurname1() {
        return surname1;
    }

    public void setSurname1(String surname1) {
        this.surname1 = surname1;
    }

    public int getCandidate_id() {
        return id;
    }

    public void setCandidate_id(int candidate_id) {
        this.id = candidate_id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    // Getters y setters para los nuevos campos
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
}
