package com.campusdual.bfp.model;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "candidates")
public class Candidate extends User{
    private String phoneNumber;
    private String Nombre, Apellido1, Apellido2;


    public Candidate() {
        super();
    }

    public Candidate(String login, String password, String email, String phoneNumber, String nombre, String apellido1, String apellido2) {
        super(login, password, email);
        this.phoneNumber = phoneNumber;
        this.Nombre = nombre;
        this.Apellido1 = apellido1;
        this.Apellido2 = apellido2;
    }


    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getNombre() {
        return Nombre;
    }

    public void setNombre(String nombre) {
        Nombre = nombre;
    }

    public String getApellido1() {
        return Apellido1;
    }

    public void setApellido1(String apellido1) {
        Apellido1 = apellido1;
    }

    public String getApellido2() {
        return Apellido2;
    }

    public void setApellido2(String apellido2) {
        Apellido2 = apellido2;
    }
}
