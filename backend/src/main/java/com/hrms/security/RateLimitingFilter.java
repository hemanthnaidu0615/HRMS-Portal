package com.hrms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Rate limiting filter using simple token bucket algorithm
 * Limits authentication endpoint requests to prevent brute force attacks
 *
 * Implementation: 5 requests per minute per IP address
 * Uses zero external dependencies - pure Java standard library
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, TokenBucket> cache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        // Apply rate limiting only to auth endpoints
        if (path.startsWith("/auth/login") || path.startsWith("/auth/forgot-password")) {
            String key = getClientIP(request);
            TokenBucket bucket = cache.computeIfAbsent(key, k -> new TokenBucket(5, 60000)); // 5 tokens, 1 minute refill

            if (bucket.tryConsume()) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    /**
     * Simple token bucket implementation for rate limiting
     * Thread-safe using atomic operations
     */
    private static class TokenBucket {
        private final long capacity;
        private final long refillIntervalMs;
        private final AtomicLong tokens;
        private final AtomicLong lastRefillTimestamp;

        public TokenBucket(long capacity, long refillIntervalMs) {
            this.capacity = capacity;
            this.refillIntervalMs = refillIntervalMs;
            this.tokens = new AtomicLong(capacity);
            this.lastRefillTimestamp = new AtomicLong(System.currentTimeMillis());
        }

        public synchronized boolean tryConsume() {
            refill();

            long currentTokens = tokens.get();
            if (currentTokens > 0) {
                tokens.decrementAndGet();
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long lastRefill = lastRefillTimestamp.get();
            long timeSinceLastRefill = now - lastRefill;

            if (timeSinceLastRefill >= refillIntervalMs) {
                // Refill all tokens after the interval has passed
                tokens.set(capacity);
                lastRefillTimestamp.set(now);
            }
        }
    }
}
