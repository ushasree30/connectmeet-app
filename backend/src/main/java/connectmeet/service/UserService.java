package connectmeet.service;

import connectmeet.entity.User;
import connectmeet.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Register a new user
    public User registerUser(String username, String email, String password) {

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        // Encrypt password before saving
        String encodedPassword = passwordEncoder.encode(password);

        User user = new User(
                username,
                encodedPassword,
                email
        );

        return userRepository.save(user);
    }

    // Login existing user
    public User loginUser(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Invalid username or password"));

        // Compare entered password with encrypted password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        return user;
    }
}