package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DAO para operaciones con mensajes
 */
@Repository
public interface MessageDao extends JpaRepository<Message, Long> {
    
    /**
     * Buscar mensajes de una conversación entre dos usuarios
     */
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversationMessages(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    /**
     * Buscar mensajes de una conversación con paginación
     */
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.timestamp DESC")
    Page<Message> findConversationMessages(@Param("userId1") Long userId1, @Param("userId2") Long userId2, Pageable pageable);
    
    /**
     * Contar mensajes no leídos para un receptor
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :receiverId AND m.read = false")
    Long countUnreadMessages(@Param("receiverId") Long receiverId);
    
    /**
     * Contar mensajes no leídos de una conversación específica
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :receiverId AND m.senderId = :senderId AND m.read = false")
    Long countUnreadMessagesFromSender(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId);
    
    /**
     * Marcar mensajes como leídos
     */
    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.receiverId = :receiverId AND m.senderId = :senderId AND m.read = false")
    int markMessagesAsRead(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId);
    
    /**
     * Obtener el último mensaje de una conversación
     */
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
           "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.timestamp DESC")
    List<Message> findLastMessage(@Param("userId1") Long userId1, @Param("userId2") Long userId2, Pageable pageable);
    
    /**
     * Buscar todas las conversaciones de un usuario
     */
    @Query("SELECT DISTINCT CASE " +
           "WHEN m.senderId = :userId THEN m.receiverId " +
           "ELSE m.senderId END " +
           "FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId")
    List<Long> findConversationPartners(@Param("userId") Long userId);
}
