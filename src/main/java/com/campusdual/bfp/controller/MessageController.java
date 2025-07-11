package com.campusdual.bfp.controller;

import com.campusdual.bfp.model.dto.MessageDTO;
import com.campusdual.bfp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageDTO>> getMessages(
            @RequestParam Long companyId,
            @RequestParam Long candidateId
    ) {
        return ResponseEntity.ok(messageService.getConversation(companyId, candidateId));
    }

    @PostMapping
    public ResponseEntity<Long> sendMessage(@RequestBody MessageDTO dto) {
        return ResponseEntity.ok(messageService.sendMessage(dto));
    }
}
