package com.lfclothing.lfclothing.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    public static final String ACCESS_COOKIE = "lf-access";
    public static final String REFRESH_COOKIE = "lf-refresh";

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    @Value("${jwt.refresh-expiration}")
    private int jwtRefreshExpirationMs;

    @Value("${jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${jwt.cookie-domain:}")
    private String cookieDomain;

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateAccessToken(String email) {
        return buildToken(email, jwtExpirationMs);
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, jwtRefreshExpirationMs);
    }

    private String buildToken(String subject, int expirationMs) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                   .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token expirado");
        } catch (MalformedJwtException e) {
            logger.warn("JWT token malformado");
        } catch (UnsupportedJwtException e) {
            logger.warn("JWT token nao suportado");
        } catch (IllegalArgumentException e) {
            logger.warn("JWT claims string vazia");
        } catch (JwtException e) {
            logger.warn("JWT token invalido");
        }
        return false;
    }

    public String getTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public void setTokenCookie(HttpServletResponse response, String name, String token, int maxAgeSec) {
        Cookie cookie = new Cookie(name, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSec);
        cookie.setAttribute("SameSite", "Lax");
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookie.setDomain(cookieDomain);
        }
        response.addCookie(cookie);
    }

    public void clearTokenCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookie.setDomain(cookieDomain);
        }
        response.addCookie(cookie);
    }

    /**
     * Seta cookies de acesso e refresh. Retorna o refresh token JWT
     * para que o caller possa persistir no banco.
     */
    public String setAuthCookies(HttpServletResponse response, String email) {
        String accessToken = generateAccessToken(email);
        String refreshToken = generateRefreshToken(email);
        setTokenCookie(response, ACCESS_COOKIE, accessToken, jwtExpirationMs / 1000);
        setTokenCookie(response, REFRESH_COOKIE, refreshToken, jwtRefreshExpirationMs / 1000);
        return refreshToken;
    }

    public int getRefreshExpirationMs() {
        return jwtRefreshExpirationMs;
    }

    public void clearAuthCookies(HttpServletResponse response) {
        clearTokenCookie(response, ACCESS_COOKIE);
        clearTokenCookie(response, REFRESH_COOKIE);
    }
}
