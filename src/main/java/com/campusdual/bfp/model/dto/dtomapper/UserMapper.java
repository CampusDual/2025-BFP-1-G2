package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.dto.SignupDTO;
import org.mapstruct.Mapper;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = org.mapstruct.factory.Mappers.getMapper(UserMapper.class);
    SignupDTO toEntity(User user);
    User toDto(SignupDTO userDTO);

}
