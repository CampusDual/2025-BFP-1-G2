package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.ChatConversation;
import com.campusdual.bfp.model.Company;
import com.campusdual.bfp.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DAO para operaciones con conversaciones de chat
 */
@Repository
public interface ChatConversationDao extends JpaRepository<ChatConversation, Long> {

    List<ChatConversation> findByCandidateOrderByLastActivityDesc(Candidate candidate);
    List<ChatConversation> findByCompanyOrderByLastActivityDesc(Company company);
    ChatConversation findByCandidateAndCompany(Candidate candidate, Company company);

    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId AND m.receiverId = :otherUserId) OR (m.senderId = :otherUserId AND m.receiverId = :userId) ORDER BY m.timestamp ASC")
    List<Message> findConversationMessages(Long userId, Long otherUserId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.receiverId = :userId AND m.read = false")
    Integer findUnreadMessagesCount(Long conversationId, Long userId);
}
