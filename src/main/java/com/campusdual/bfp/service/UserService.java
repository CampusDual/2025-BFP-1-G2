package com.campusdual.bfp.service;

import com.campusdual.bfp.model.Candidate;
import com.campusdual.bfp.model.Role;
import com.campusdual.bfp.model.User;
import com.campusdual.bfp.model.UserRole;
import com.campusdual.bfp.model.dao.CandidateDao;
import com.campusdual.bfp.model.dao.RoleDao;
import com.campusdual.bfp.model.dao.UserDao;
import com.campusdual.bfp.model.dao.UserRoleDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Lazy
public class UserService implements UserDetailsService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private UserRoleDao userRoleDao;

    @Autowired
    private CandidateDao candidateDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userDao.findByLogin(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return new org.springframework.security.core.userdetails.User(user.getUsername(),user.getPassword(), user.getAuthorities());
    }

    public boolean existsByUsername(String username) {
        User user = this.userDao.findByLogin(username);
        return user != null;
    }

    public int registerNewUser(String username, String password, String email, String roleName) {
        User user = new User();
        user.setLogin(username);
        user.setPassword(this.passwordEncoder().encode(password));
        user.setEmail(email);
        User savedUser = this.userDao.saveAndFlush(user);

        Role role = this.roleDao.findByRoleName(roleName);
        if (role != null) {
            UserRole userRole = new UserRole();
            userRole.setUser(savedUser);
            userRole.setRole(role);
            this.userRoleDao.saveAndFlush(userRole);
        }

        return savedUser.getId();
    }

    public void registerNewCandidate(String username, String password, String email, String name,
                                String surname1, String surname2, String phoneNumber, String roleName) {
        int id;
        Candidate candidate = new Candidate();
        candidate.setName(name);
        candidate.setSurname1(surname1);
        candidate.setSurname2(surname2);
        candidate.setPhone_number(phoneNumber);
        id = this.registerNewUser(username, password, email, roleName);
        candidate.setUser_id(id);
        this.candidateDao.saveAndFlush(candidate);
    }

    public UserDao getUserDao() {
        return userDao;
    }

    public void addRoleToUser(int userId, Long roleName) {
        User user = this.userDao.findUserById(userId);
        if (user != null) {
            Role role = this.roleDao.findById(roleName)
                    .orElse(null);
            // Use Optional to handle the case where the role might not exist
            if (role != null) {
                UserRole userRole = new UserRole();
                userRole.setUser(user);
                userRole.setRole(role);
                this.userRoleDao.saveAndFlush(userRole);
            }
        }
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
