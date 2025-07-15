package com.campusdual.bfp.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * DTO para mensajes del chat
 */
public class MessageDTO {
    
    private int id;
    private int senderId;
    private int receiverId;
    private String content;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    private Boolean read;
    private SenderType senderType;
    
    public enum SenderType {
        CANDIDATE, COMPANY
    }
    
    // Constructores
    public MessageDTO() {}
    
    public MessageDTO(int senderId, int receiverId, String content, SenderType senderType) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.senderType = senderType;
        this.timestamp = LocalDateTime.now();
        this.read = false;
    }
    
    // Getters y Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getSenderId() {
        return senderId;
    }
    
    public void setSenderId(int senderId) {
        this.senderId = senderId;
    }
    
    public int getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(int receiverId) {
        this.receiverId = receiverId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Boolean getRead() {
        return read;
    }
    
    public void setRead(Boolean read) {
        this.read = read;
    }
    
    public SenderType getSenderType() {
        return senderType;
    }
    
    public void setSenderType(SenderType senderType) {
        this.senderType = senderType;
    }
}