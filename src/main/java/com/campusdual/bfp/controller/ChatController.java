package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IChatService;
import com.campusdual.bfp.model.dto.ChatConversationDTO;
import com.campusdual.bfp.model.dto.MessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private IChatService chatService;

    /**
     * Enviar un mensaje
     */
    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageDTO messageDTO) {
        MessageDTO sentMessage = chatService.sendMessage(messageDTO);
        return ResponseEntity.ok(sentMessage);
    }

    /**
     * Obtener mensajes de una conversación
     */
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(
            @PathVariable int otherUserId,
            Principal principal,
            @RequestParam MessageDTO.SenderType userType) {
        List<MessageDTO> messages = chatService.getConversationMessages(principal.getName(), otherUserId,userType);
        return ResponseEntity.ok(messages);
    }

    /**
     * Obtener mensajes de una conversación con paginación
     */
    @GetMapping("/conversation/{otherUserId}/paged")
    public ResponseEntity<Page<MessageDTO>> getConversationMessagesPaged(
            @PathVariable long otherUserId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageDTO> messages = chatService.getConversationMessages(principal.getName(), otherUserId, pageable);
        return ResponseEntity.ok(messages);
    }

    /**
     * Marcar mensajes como leídos
     */
    @PutMapping("/markread/{otherUserId}")
    public ResponseEntity<Integer> markMessagesAsRead(
            Principal principal,
            @PathVariable int otherUserId,
            @RequestParam MessageDTO.SenderType userType) {
        int markedCount = chatService.markMessagesAsRead(principal.getName(), otherUserId, userType);
        return ResponseEntity.ok(markedCount);
    }

    /**
     * Obtener conversaciones de un usuario
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationDTO>> getUserConversations(
            Principal principal,
            @RequestParam MessageDTO.SenderType userType) {
        List<ChatConversationDTO> conversations = chatService.getUserConversationsSimple(principal.getName(), userType);
        return ResponseEntity.ok(conversations);
    }

    /**
     * Buscar conversación entre dos usuarios
     */
    @GetMapping("/conversation/find/{otherUserId}")
    public ResponseEntity<ChatConversationDTO> findConversation(
            @PathVariable int otherUserId,
            @RequestParam MessageDTO.SenderType userType,
            Principal principal) {
        ChatConversationDTO conversation = chatService.findConversation(principal.getName(), otherUserId, userType);
        return ResponseEntity.of(Optional.ofNullable(conversation));
    }
}
