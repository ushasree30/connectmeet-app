package connectmeet.controller;

import connectmeet.dto.LoginRequest;
import connectmeet.dto.LoginResponse;
import connectmeet.entity.User;
import connectmeet.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // Register
    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password) {

        User user = userService.registerUser(
                username,
                email,
                password
        );

        return ResponseEntity.ok(user);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        User user = userService.loginUser(
                request.getUsername(),
                request.getPassword()
        );

        LoginResponse response = new LoginResponse(
                "Login successful",
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }
}