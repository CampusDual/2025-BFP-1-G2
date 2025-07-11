package com.campusdual.bfp.service;

import com.campusdual.bfp.model.Message;
import com.campusdual.bfp.model.dao.MessageDao;
import com.campusdual.bfp.model.dto.MessageDTO;
import com.campusdual.bfp.model.dto.dtomapper.MessageMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageDao messageDao;
    private final MessageMapper mapper;

    public MessageService(
            MessageDao messageDao,
            MessageMapper mapper
    ) {
        this.messageDao = messageDao;
        this.mapper = mapper;
    }

    public List<MessageDTO> getConversation(Long companyId, Long candidateId) {
        List<Message> messages = messageDao.findByCompanyIdAndCandidateIdOrderByDateMessageAsc(companyId, candidateId);
        return mapper.toDtoList(messages);
    }

    public Long sendMessage (MessageDTO dto) {
        return messageDao.saveAndFlush(MessageMapper.INSTANCE.toEntity(dto)).getId();
    }
}
