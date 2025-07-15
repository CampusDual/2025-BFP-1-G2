package com.campusdual.bfp.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * DTO para conversaciones del chat
 */
public class ChatConversationDTO {
    
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateAvatar;
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private MessageDTO lastMessage;
    private Integer unreadCount;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;
    
    // Constructores
    public ChatConversationDTO() {}
    
    public ChatConversationDTO(Long candidateId, Long companyId) {
        this.candidateId = candidateId;
        this.companyId = companyId;
        this.unreadCount = 0;
        this.lastActivity = LocalDateTime.now();
    }
    
    // Getters y Setters
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
    
    public String getCandidateName() {
        return candidateName;
    }
    
    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }
    
    public String getCandidateAvatar() {
        return candidateAvatar;
    }
    
    public void setCandidateAvatar(String candidateAvatar) {
        this.candidateAvatar = candidateAvatar;
    }
    
    public Long getCompanyId() {
        return companyId;
    }
    
    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getCompanyLogo() {
        return companyLogo;
    }
    
    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }
    
    public MessageDTO getLastMessage() {
        return lastMessage;
    }
    
    public void setLastMessage(MessageDTO lastMessage) {
        this.lastMessage = lastMessage;
    }
    
    public Integer getUnreadCount() {
        return unreadCount;
    }
    
    public void setUnreadCount(Integer unreadCount) {
        this.unreadCount = unreadCount;
    }
    
    public LocalDateTime getLastActivity() {
        return lastActivity;
    }
    
    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }
}
