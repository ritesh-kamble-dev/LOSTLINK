package com.example.LostAndFound.service;

import com.example.LostAndFound.entity.User;
import com.example.LostAndFound.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String registerUser(User user) {
        Optional<User> existingUserByEmail = userRepository.findByEmail(user.getEmail());
        if (existingUserByEmail.isPresent()) {
            return "Email is already in use!";
        }

        Optional<User> existingUserByUsername = userRepository.findByUsername(user.getUsername());
        if (existingUserByUsername.isPresent()) {
            return "Username is already taken!";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword())); 

        userRepository.save(user);
        return "User registered successfully!";
    }

    public User validateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        
        return null;
    }

    @Transactional
    public String updateUser(String username, User updatedUser) {
        Optional<User> existingUserOpt = userRepository.findByUsername(username);

        if (!existingUserOpt.isPresent()) {
            return "User not found"; 
        }

        Optional<User> userWithNewEmail = userRepository.findByEmail(updatedUser.getEmail());
        if (userWithNewEmail.isPresent() && !userWithNewEmail.get().getUsername().equals(username)) {
            return "Email is already taken";
        }

        Optional<User> userWithNewUsername = userRepository.findByUsername(updatedUser.getUsername());
        if (userWithNewUsername.isPresent() && !userWithNewUsername.get().getUsername().equals(username)) {
            return "Username is already taken";
        }

        User existingUser = existingUserOpt.get();
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setDate_of_birth(updatedUser.getDate_of_birth());
        existingUser.setGender(updatedUser.getGender());

        if (updatedUser.getProfilePicture() != null && !updatedUser.getProfilePicture().isEmpty()) {
            existingUser.setProfilePicture(updatedUser.getProfilePicture());
        }

        User savedUser = userRepository.save(existingUser);
        System.out.println("User saved: " + savedUser);
        return "User updated successfully!";
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public long count(){
        return userRepository.count();
    }
    
    public boolean updateProfilePicture(String username, String encodedImage) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setProfilePicture(encodedImage);

            userRepository.save(user);

            return true;
        } catch (Exception e) {
            System.out.println("\n\n\n\n\n" + e);
            return false;
        }
    }
}
