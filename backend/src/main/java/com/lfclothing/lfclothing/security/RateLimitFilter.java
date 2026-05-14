package com.lfclothing.lfclothing.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    // Limites por janela de tempo (em segundos)
    private static final int AUTH_WINDOW_SECONDS = 60;
    private static final int AUTH_MAX_REQUESTS = 10; // 10 tentativas de login/registro por minuto por IP

    private static final int GLOBAL_WINDOW_SECONDS = 60;
    private static final int GLOBAL_MAX_REQUESTS = 120; // 120 requests por minuto por IP (geral)

    private static final int COUPON_WINDOW_SECONDS = 60;
    private static final int COUPON_MAX_REQUESTS = 15; // 15 validações de cupom por minuto

    private final Map<String, RateBucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, RateBucket> globalBuckets = new ConcurrentHashMap<>();
    private final Map<String, RateBucket> couponBuckets = new ConcurrentHashMap<>();

    private volatile long lastCleanup = System.currentTimeMillis();
    private static final long CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // limpa a cada 5 min

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Security header que o Spring Security 7 não expõe via DSL
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Limpa buckets expirados periodicamente
        cleanupIfNeeded();

        // Rate limit estrito para auth endpoints (login, registro, refresh)
        if (isAuthEndpoint(path, method)) {
            if (!checkLimit(authBuckets, clientIp, AUTH_WINDOW_SECONDS, AUTH_MAX_REQUESTS)) {
                logger.warn("Rate limit AUTH excedido para IP: {}", clientIp);
                sendTooManyRequests(response, "Muitas tentativas. Aguarde 1 minuto.");
                return;
            }
        }

        // Rate limit para validação de cupom (pode ser abusado para enumerar cupons)
        if (path.equals("/api/cupons/validar") && "POST".equals(method)) {
            if (!checkLimit(couponBuckets, clientIp, COUPON_WINDOW_SECONDS, COUPON_MAX_REQUESTS)) {
                logger.warn("Rate limit CUPOM excedido para IP: {}", clientIp);
                sendTooManyRequests(response, "Muitas tentativas de cupom. Aguarde.");
                return;
            }
        }

        // Rate limit global por IP
        if (!checkLimit(globalBuckets, clientIp, GLOBAL_WINDOW_SECONDS, GLOBAL_MAX_REQUESTS)) {
            logger.warn("Rate limit GLOBAL excedido para IP: {}", clientIp);
            sendTooManyRequests(response, "Muitas requisicoes. Aguarde.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAuthEndpoint(String path, String method) {
        if (!"POST".equals(method)) return false;
        return path.equals("/api/autenticacao/login")
            || path.equals("/api/autenticacao/registrar")
            || path.equals("/api/autenticacao/refresh");
    }

    private boolean checkLimit(Map<String, RateBucket> buckets, String key, int windowSeconds, int maxRequests) {
        long now = System.currentTimeMillis();
        RateBucket bucket = buckets.compute(key, (k, existing) -> {
            if (existing == null || existing.isExpired(now)) {
                return new RateBucket(now + windowSeconds * 1000L);
            }
            return existing;
        });
        return bucket.tryConsume(maxRequests);
    }

    private String getClientIp(HttpServletRequest request) {
        // Railway/Cloudflare passam o IP real via headers
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // Pega o primeiro IP (cliente original)
            String ip = xForwardedFor.split(",")[0].trim();
            if (isValidIp(ip)) return ip;
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && isValidIp(xRealIp.trim())) {
            return xRealIp.trim();
        }

        String cfIp = request.getHeader("CF-Connecting-IP");
        if (cfIp != null && !cfIp.isBlank() && isValidIp(cfIp.trim())) {
            return cfIp.trim();
        }

        return request.getRemoteAddr();
    }

    private boolean isValidIp(String ip) {
        // Validação básica para evitar header injection
        return ip.matches("^[0-9a-fA-F.:]+$") && ip.length() <= 45;
    }

    private void sendTooManyRequests(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setHeader("Retry-After", "60");
        response.getWriter().write("{\"status\":429,\"erro\":\"" + message + "\"}");
    }

    private void cleanupIfNeeded() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now;
            authBuckets.entrySet().removeIf(e -> e.getValue().isExpired(now));
            globalBuckets.entrySet().removeIf(e -> e.getValue().isExpired(now));
            couponBuckets.entrySet().removeIf(e -> e.getValue().isExpired(now));
        }
    }

    private static class RateBucket {
        private final long expiresAt;
        private final AtomicInteger count = new AtomicInteger(0);

        RateBucket(long expiresAt) {
            this.expiresAt = expiresAt;
        }

        boolean isExpired(long now) {
            return now >= expiresAt;
        }

        boolean tryConsume(int max) {
            return count.incrementAndGet() <= max;
        }
    }
}
