package com.campusdual.bfp.model;

import javax.persistence.*;

@Entity
@Table(name = "tag")
public class Tag {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY )
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Tag() {

    }

    public Tag(String name) {
        this.name = name;
    }



    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
