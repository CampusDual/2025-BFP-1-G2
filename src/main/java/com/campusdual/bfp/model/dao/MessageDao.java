package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageDao extends JpaRepository<Message, Long> {

    List<Message> findByCompanyIdAndCandidateIdOrderByDateMessageAsc(Long companyId, Long candidateId);
}
