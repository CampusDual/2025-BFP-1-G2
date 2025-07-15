package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Message;
import com.campusdual.bfp.model.dto.MessageDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper
public interface MessageMapper {
    MessageMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(MessageMapper.class);

    MessageDTO toDto(Message message);
    Message toEntity(MessageDTO messageDto);
    List<MessageDTO> toDtoList(List<Message> messages);
}