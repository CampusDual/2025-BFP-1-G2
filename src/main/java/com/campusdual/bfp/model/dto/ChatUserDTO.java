package com.campusdual.bfp.model.dto;

/**
 * DTO para usuarios del chat
 */
public class ChatUserDTO {
    
    private Long id;
    private String name;
    private String avatar;
    private UserType type;
    private Boolean isOnline;
    
    public enum UserType {
        CANDIDATE, COMPANY
    }
    
    // Constructores
    public ChatUserDTO() {}
    
    public ChatUserDTO(Long id, String name, UserType type) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.isOnline = false;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public UserType getType() {
        return type;
    }
    
    public void setType(UserType type) {
        this.type = type;
    }
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
}
