package com.campusdual.bfp.model.dto;


public class CandidateDTO extends SignupDTO {
    private String phoneNumber;
    private String nombre;
    private String apellido1;
    private String apellido2;

    public CandidateDTO() {
        // Default constructor
    }

    public CandidateDTO(String login, String password, String email, String phoneNumber, String nombre, String apellido1, String apellido2) {
        super.setLogin(login);
        this.phoneNumber = phoneNumber;
        this.nombre = nombre;
        this.apellido1 = apellido1;
        this.apellido2 = apellido2;
    }


    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getApellido1() {
        return apellido1;
    }

    public void setApellido1(String apellido1) {
        this.apellido1 = apellido1;
    }

    public String getApellido2() {
        return apellido2;
    }

    public void setApellido2(String apellido2) {
        this.apellido2 = apellido2;
    }
}
