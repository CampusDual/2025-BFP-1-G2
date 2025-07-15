package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.ChatConversationDTO;
import com.campusdual.bfp.model.dto.MessageDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IChatService {

    MessageDTO sendMessage(MessageDTO messageDTO);

    List<MessageDTO> getConversationMessages(String userName, int otherUserId, MessageDTO.SenderType userType);

    Page<MessageDTO> getConversationMessages(String userName, Long otherUserId, Pageable pageable);

    int markMessagesAsRead(String userName, int otherUserId, MessageDTO.SenderType userType);

    List<ChatConversationDTO> getUserConversationsSimple(String userName, MessageDTO.SenderType userType);

    ChatConversationDTO findConversation(String userName, int otherUserId, MessageDTO.SenderType userType);

}
