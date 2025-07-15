package com.campusdual.bfp.model;

import com.campusdual.bfp.model.dto.MessageDTO;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad para mensajes del chat
 */
@Entity
@Table(name = "chat_messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;
    
    @Column(name = "content", nullable = false, length = 1000)
    private String content;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "is_read", nullable = false)
    private Boolean read = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false)
    private MessageDTO.SenderType senderType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private ChatConversation conversation;
    
    // Constructores
    public Message() {}
    
    public Message(Long senderId, Long receiverId, String content, MessageDTO.SenderType senderType) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.senderType = senderType;
        this.timestamp = LocalDateTime.now();
        this.read = false;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSenderId() {
        return senderId;
    }
    
    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }
    
    public Long getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(Long receiverId) {
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

    public MessageDTO.SenderType getSenderType() {
        return senderType;
    }

    public void setSenderType(MessageDTO.SenderType senderType) {
        this.senderType = senderType;
    }

    public ChatConversation getConversation() {
        return conversation;
    }
    
    public void setConversation(ChatConversation conversation) {
        this.conversation = conversation;
    }
}
