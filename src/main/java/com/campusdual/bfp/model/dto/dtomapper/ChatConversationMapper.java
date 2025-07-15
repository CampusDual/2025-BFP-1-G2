package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.ChatConversation;
import com.campusdual.bfp.model.Message;
import com.campusdual.bfp.model.dto.ChatConversationDTO;
import com.campusdual.bfp.model.dto.MessageDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Comparator;
import java.util.List;

@Mapper(uses = {MessageMapper.class})
public interface ChatConversationMapper {
    ChatConversationMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(ChatConversationMapper.class);

    @Mapping(source = "candidate.user.id", target = "candidateId")
    @Mapping(source = "candidate.user.login", target = "candidateName")
    @Mapping(source = "candidate.logoImageBase64", target = "candidateAvatar")
    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "company.name", target = "companyName")
    @Mapping(source = "company.logo", target = "companyLogo")
    @Mapping(target = "lastMessage", source = ".", qualifiedByName = "getLastMessage")
    ChatConversationDTO toDto(ChatConversation conversation);

    @Named("getLastMessage")
    default MessageDTO getLastMessage(ChatConversation conversation) {
        if (conversation.getMessages() == null || conversation.getMessages().isEmpty()) return null;
        Message last = conversation.getMessages().stream()
                .max(Comparator.comparing(Message::getTimestamp))
                .orElse(null);
        return last != null ? MessageMapper.INSTANCE.toDto(last) : null;
    }

    ChatConversation toEntity(ChatConversationDTO conversationDto);


    List<ChatConversationDTO> toDtoList(List<ChatConversation> conversations);
}
