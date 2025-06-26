package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagDao extends JpaRepository<Tag, Long> {
    boolean existsTagByName(String name);
}
