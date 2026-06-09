package com.lfclothing.lfclothing.security;

public final class InputSanitizer {

    private InputSanitizer() {}

    /**
     * Remove tags HTML/script para prevenir XSS armazenado.
     */
    public static String sanitizeHtml(String input) {
        if (input == null) return null;
        return input
            .replaceAll("<[^>]*>", "")                         // remove tags HTML
            .replaceAll("(?i)javascript\\s*:", "")             // remove javascript: (case insensitive, com espaços)
            .replaceAll("(?i)vbscript\\s*:", "")               // remove vbscript:
            .replaceAll("(?i)data\\s*:", "")                   // remove data: URIs
            .replaceAll("(?i)on\\w+\\s*=", "")                // remove event handlers
            .replaceAll("(?i)expression\\s*\\(", "")          // remove CSS expressions
            .replaceAll("&#[xX]?[0-9a-fA-F]+;?", "")         // remove HTML numeric entities
            .replaceAll("&\\w+;", "")                          // remove HTML named entities
            .trim();
    }

    /**
     * Sanitiza texto genérico — remove caracteres de controle perigosos.
     */
    public static String sanitizeText(String input) {
        if (input == null) return null;
        // Remove null bytes e caracteres de controle (exceto newline e tab)
        return input.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "").trim();
    }

    /**
     * Valida se uma URL é segura (HTTPS ou path relativo).
     */
    public static boolean isValidUrl(String url) {
        if (url == null || url.isBlank()) return true; // nullable é ok
        return url.startsWith("https://") || url.startsWith("/");
    }

    /**
     * Limita quantidade a um valor máximo para prevenir abuse.
     */
    public static int clampQuantity(int value, int max) {
        return Math.max(1, Math.min(value, max));
    }
}
