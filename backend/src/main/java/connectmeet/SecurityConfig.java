package connectmeet;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .authorizeHttpRequests(auth -> auth

                // Health
                .requestMatchers("/api/health").permitAll()

                // Login / registration
                .requestMatchers("/api/auth/**").permitAll()

                // Meetings - IMPORTANT
                .requestMatchers("/api/meetings/**").permitAll()

                // H2 console
                .requestMatchers("/h2-console/**").permitAll()

                // Everything else
                .anyRequest().permitAll()
            )

            .formLogin(form -> form.disable())

            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}