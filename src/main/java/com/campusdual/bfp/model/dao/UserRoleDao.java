package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Role;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleDao extends JpaRepository<UserRole, Long> {
    UserRole findUserRoleByUserAndRole(User user, Role roleName);
    UserRole findUserRoleByUserId(int user);
    List<UserRole> findUserRolesByUser(User user);
}
