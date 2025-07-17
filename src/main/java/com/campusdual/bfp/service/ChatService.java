package com.campusdual.bfp.service;

import com.campusdual.bfp.api.IChatService;
import com.campusdual.bfp.model.*;
import com.campusdual.bfp.model.dao.*;
import com.campusdual.bfp.model.dto.ChatConversationDTO;
import com.campusdual.bfp.model.dto.MessageDTO;
import com.campusdual.bfp.model.dto.dtomapper.ChatConversationMapper;
import com.campusdual.bfp.model.dto.dtomapper.MessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService implements IChatService {

    @Autowired
    private MessageDao messageDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private CompanyDao companyDao;

    @Autowired
    private ChatConversationDao chatConversationDao;

    public MessageDTO sendMessage(MessageDTO messageDTO) {
        ChatConversation conversation = getOrCreateConversation(
                messageDTO.getSenderId(),
                messageDTO.getReceiverId(),
                messageDTO.getSenderType()
        );
        if  (messageDTO.getContent() == null || messageDTO.getContent().isEmpty()) {
            chatConversationDao.save(conversation);
            return messageDTO;
        }

        Message message = MessageMapper.INSTANCE.toEntity(messageDTO);
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        message.setConversation(conversation);
        messageDao.save(message);
        conversation.setLastActivity(LocalDateTime.now());
        chatConversationDao.save(conversation);

        return MessageMapper.INSTANCE.toDto(message);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getConversationMessages(String userName, int otherUserId, MessageDTO.SenderType userType) {
        User user = userDao.findByLogin(userName);
        if (user == null) throw new IllegalArgumentException("Usuario no encontrado: " + userName);
        if (userType == MessageDTO.SenderType.CANDIDATE) {
            Candidate candidate = candidateDao.findCandidateByUser(user);
            Company company = companyDao.findById(otherUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada con ID: " + otherUserId));
            if (candidate == null) {
                throw new IllegalArgumentException("No existe candidato para el usuario: " + userName);
            }
            return MessageMapper.INSTANCE.toDtoList(chatConversationDao.findByCandidateAndCompany(candidate, company).getMessages());
        } else {
            Company company = companyDao.findCompanyByUser(user);
            User candidateUser = userDao.findUserById(otherUserId);
            Candidate candidate = candidateDao.findCandidateByUser(candidateUser);
            if (candidate == null) {
                throw new IllegalArgumentException("No existe candidato para el usuario: " + userName);
            }
            return MessageMapper.INSTANCE.toDtoList(chatConversationDao.findByCandidateAndCompany(candidate, company).getMessages());
        }
    }

    @Transactional(readOnly = true)
    public Page<MessageDTO> getConversationMessages(String userName, Long otherUserId, Pageable pageable) {
        User user = userDao.findByLogin(userName);
        if (user == null) throw new IllegalArgumentException("Usuario no encontrado: " + userName);
        Long userId1 = (long) user.getId();
        Page<Message> messages = messageDao.findConversationMessages(userId1, otherUserId, pageable);
        return messages.map(MessageMapper.INSTANCE::toDto);
    }

    public int markMessagesAsRead(String userName, int otherUserId, MessageDTO.SenderType userType) {
        User user = userDao.findByLogin(userName);
        Candidate candidate;
        Company company;
        if (user == null) throw new IllegalArgumentException("Usuario no encontrado: " + userName);

        if (userType == MessageDTO.SenderType.CANDIDATE) {
            candidate = candidateDao.findCandidateByUser(user);
            company = companyDao.findById(otherUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada con ID: " + otherUserId));
            if (candidate == null) {
                throw new IllegalArgumentException("No existe candidato para el usuario: " + userName);
            }
        } else {
            company = companyDao.findCompanyByUser(user);
            User candidateUser = userDao.findUserById(otherUserId);
            candidate = candidateDao.findCandidateByUser(candidateUser);
            if (candidate == null) {
                throw new IllegalArgumentException("No existe candidato para el usuario: " + userName);
            }
        }
        List<Message> messages = chatConversationDao.findByCandidateAndCompany(candidate, company).getMessages()
                .stream()
                .filter(message -> !message.getRead())
                .collect(Collectors.toList());
        if (messages.isEmpty()) {
            return 0;
        }
        messages.forEach(message -> {
            message.setRead(true);
            messageDao.saveAndFlush(message);
        });
        return messages.size();
    }

    @Transactional(readOnly = true)
    public List<ChatConversationDTO> getUserConversationsSimple(String userName, MessageDTO.SenderType userType) {
        User user = userDao.findByLogin(userName);
        if (user == null) throw new IllegalArgumentException("Usuario no encontrado: " + userName);
        List<ChatConversationDTO> conversations;
        if (userType == MessageDTO.SenderType.CANDIDATE) {
            Candidate candidate = candidateDao.findCandidateByUser(user);
            if (candidate == null)
                throw new IllegalArgumentException("No existe candidato para el usuario: " + userName);
            conversations = ChatConversationMapper.INSTANCE.toDtoList(chatConversationDao.findByCandidateOrderByLastActivityDesc(candidate));
            conversations.forEach(conversation -> conversation
                    .setUnreadCount(chatConversationDao.findUnreadMessagesCount(conversation.getId(), (long) user.getId())));
        } else {
            Company company = companyDao.findCompanyByUser(user);
            if (company == null) throw new IllegalArgumentException("No existe empresa para el usuario: " + userName);
            conversations = ChatConversationMapper.INSTANCE.toDtoList(chatConversationDao.findByCompanyOrderByLastActivityDesc(company));
            conversations.forEach(conversation -> conversation
                    .setUnreadCount(chatConversationDao.findUnreadMessagesCount(conversation.getId(), (long) company.getId())));
        }
        return conversations;
    }

    @Transactional(readOnly = true)
    public ChatConversationDTO findConversation(String userName, int otherUserId, MessageDTO.SenderType userType) {
        User user = userDao.findByLogin(userName);
        if (user == null) throw new IllegalArgumentException("Usuario no encontrado: " + userName);

        if (userType == MessageDTO.SenderType.CANDIDATE) {
            Candidate candidate = candidateDao.findCandidateByUser(user);
            User companyUser = userDao.findUserById(otherUserId);
            Company company = companyDao.findCompanyByUser(companyUser);
            if (candidate == null || company == null) {
                throw new IllegalArgumentException("No existe candidato para el usuario: " + userName);
            }
            return ChatConversationMapper.INSTANCE.toDto(chatConversationDao.findByCandidateAndCompany(candidate, company));
        } else {
            Company company = companyDao.findCompanyByUser(user);
            User candidateUser = userDao.findUserById(otherUserId);
            Candidate candidate = candidateDao.findCandidateByUser(candidateUser);
            if (candidate == null || company == null) {
                throw new IllegalArgumentException("No existe candidato para el usuario: " + userName);
            }
            return ChatConversationMapper.INSTANCE.toDto(chatConversationDao.findByCandidateAndCompany(candidate, company));
        }
    }

    private ChatConversation getOrCreateConversation(int senderUserId, int receiverUserId, MessageDTO.SenderType senderType) {
        Candidate candidate;
        Company company;

        if (senderType == MessageDTO.SenderType.CANDIDATE) {
            User candidateUser = userDao.findUserById(senderUserId);
            candidate = candidateDao.findCandidateByUser(candidateUser);
            company = companyDao.findById(receiverUserId).orElseThrow(
                    () -> new IllegalArgumentException("Empresa no encontrada con ID: " + receiverUserId)
            );
        } else {
            User candidateUser = userDao.findUserById(receiverUserId);
            candidate = candidateDao.findCandidateByUser(candidateUser);
            company = companyDao.findById(senderUserId).orElseThrow(
                    () -> new IllegalArgumentException("Empresa no encontrada con ID: " + senderUserId)
            );
        }

        if (candidate == null || company == null)
            throw new IllegalArgumentException("Candidato o empresa no encontrados");

        ChatConversation existing = chatConversationDao.findByCandidateAndCompany(candidate, company);
        if (existing != null) {
            return existing;
        }

        ChatConversation conversation = new ChatConversation();
        conversation.setCandidate(candidate);
        conversation.setCompany(company);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setLastActivity(LocalDateTime.now());

        return chatConversationDao.save(conversation);
    }

}