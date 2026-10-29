package com.weave.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class CorsConfig {
    @Value("${weave.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;
    @Value("${weave.cors.allowed-origin-patterns:}")
    private String allowedOriginPatterns;

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")).stream().map(String::trim).filter(origin -> !origin.isBlank()).toList());
        List<String> patterns = List.of(allowedOriginPatterns.split(",")).stream().map(String::trim).filter(pattern -> !pattern.isBlank()).toList();
        if (!patterns.isEmpty()) config.setAllowedOriginPatterns(patterns);
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Request-Id", "X-Weave-CSRF"));
        config.setExposedHeaders(List.of("X-Request-Id"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
