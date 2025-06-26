package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Tag;
import com.campusdual.bfp.model.dto.TagDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper
public interface TagMapper {
    TagMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(TagMapper.class);
    TagDTO toTagDTO(Tag tag);
    Tag toTag(TagDTO tagDTO);
    List<TagDTO> toTagDTOs(List<Tag> tags);
}
