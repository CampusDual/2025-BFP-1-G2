package com.campusdual.bfp.model.dto;
import java.util.Date;

public class MessageDTO {
    private Long id;
    private Long companyId;
    private Long candidateId;
    private String sender; // "Company" or "Candidate"
    private String message;
    private Date dateMessage;

    public Long getMessageId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Long getCompanyId() {return companyId;}
    public Long getCandidateId() {return candidateId;}
    public void setCompanyId(Long companyId) {this.companyId = companyId;}
    public void setCandidateId(Long candidateId) {this.candidateId = candidateId;}
    public String getSender() {return sender;}
    public void setSender(String sender) {this.sender = sender;}
    public String getMessage() {return message;}
    public void setMessage(String message) {this.message = message;}
    public Date getDateMessage() {return dateMessage;}
    public void setDateMessage(Date date_Message) {this.dateMessage = date_Message;}
}