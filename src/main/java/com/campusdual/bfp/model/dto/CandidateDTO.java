package com.campusdual.bfp.model.dto;


public class CandidateDTO extends SignupDTO {

    private String phoneNumber;
    private String name;
    private String surname1;
    private String surname2;
    private Boolean valid;


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
}