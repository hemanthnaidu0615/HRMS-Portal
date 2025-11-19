package com.hrms.service;

import com.hrms.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    private static final int MINIMUM_SECRET_LENGTH = 32; // 256 bits

    @Value("${security.jwt.secret}")
    private String secretKey;

    @Value("${security.jwt.expiration:86400000}")
    private long expirationTime;

    @PostConstruct
    public void validateSecretKey() {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret key is not configured. Set SECURITY_JWT_SECRET environment variable.");
        }

        // Check for known insecure defaults
        if ("changeme-dev-secret".equals(secretKey) || "secret".equals(secretKey)) {
            throw new IllegalStateException("Insecure default JWT secret detected. Use a strong random secret in production.");
        }

        if (secretKey.length() < MINIMUM_SECRET_LENGTH) {
            throw new IllegalStateException(
                String.format("JWT secret is too short (%d chars). Minimum required: %d chars (256 bits).",
                    secretKey.length(), MINIMUM_SECRET_LENGTH));
        }

        logger.info("JWT secret key validated successfully (length: {} chars)", secretKey.length());
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId().toString());
        claims.put("email", user.getEmail());
        claims.put("roles", user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toList()));

        // Add organization ID if user belongs to an organization
        if (user.getOrganization() != null) {
            claims.put("organizationId", user.getOrganization().getId().toString());
        }

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        Claims claims = extractClaims(token);
        return claims.get("roles", List.class);
    }

    public String extractOrganizationId(String token) {
        Claims claims = extractClaims(token);
        return claims.get("organizationId", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
