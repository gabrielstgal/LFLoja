package com.lfclothing.lfclothing.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Controle de tentativas de login POR CONTA (email), complementar ao rate limit
 * por IP do {@code RateLimitFilter}. Apos {@link #MAX_TENTATIVAS} falhas seguidas,
 * a conta fica temporariamente bloqueada por {@link #BLOQUEIO_DURACAO_MS}.
 *
 * <p>Estado em memoria (mesmo padrao do RateLimitFilter). Nao persiste entre
 * reinicios nem entre instancias — adequado para o deploy atual (instancia unica).
 *
 * <p>As tentativas sao contadas pelo email SUBMETIDO (normalizado), exista a conta
 * ou nao. Isso preserva o anti-enumeracao: um email inexistente se comporta igual
 * a um existente, sem revelar se a conta existe.
 */
@Service
public class LoginAttemptService {

    /** Numero de falhas consecutivas que dispara o bloqueio. */
    public static final int MAX_TENTATIVAS = 5;

    /** Duracao do bloqueio temporario. */
    private static final long BLOQUEIO_DURACAO_MS = 2 * 60 * 60 * 1000L; // 2 horas

    /** Intervalo entre limpezas de entradas ociosas. */
    private static final long CLEANUP_INTERVAL_MS = 30 * 60 * 1000L; // 30 minutos

    private final Map<String, Tentativa> tentativas = new ConcurrentHashMap<>();
    private volatile long ultimaLimpeza = System.currentTimeMillis();

    private String normalizar(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    /** True se a conta esta atualmente bloqueada. */
    public boolean isBloqueado(String email) {
        Tentativa t = tentativas.get(normalizar(email));
        return t != null && t.bloqueadoAte > System.currentTimeMillis();
    }

    /** Minutos restantes de bloqueio (arredondado para cima), ou 0 se nao bloqueado. */
    public long minutosRestantesBloqueio(String email) {
        Tentativa t = tentativas.get(normalizar(email));
        if (t == null) return 0;
        long restanteMs = t.bloqueadoAte - System.currentTimeMillis();
        if (restanteMs <= 0) return 0;
        return (restanteMs + 59_999) / 60_000;
    }

    /** Tempo restante de bloqueio em texto amigavel (ex.: "2 horas", "1 hora e 30 minutos", "45 minutos"). */
    public String tempoRestanteFormatado(String email) {
        long minutos = minutosRestantesBloqueio(email);
        if (minutos <= 0) return "instantes";
        long horas = minutos / 60;
        long min = minutos % 60;
        if (horas == 0) return min + (min == 1 ? " minuto" : " minutos");
        String parteHora = horas + (horas == 1 ? " hora" : " horas");
        if (min == 0) return parteHora;
        return parteHora + " e " + min + (min == 1 ? " minuto" : " minutos");
    }

    /**
     * Registra uma falha de login para o email.
     *
     * @return quantas tentativas restam antes do bloqueio; 0 significa que a conta
     *         acabou de ser (ou ja estava) bloqueada.
     */
    public int registrarFalha(String email) {
        limparSeNecessario();
        long agora = System.currentTimeMillis();
        Tentativa t = tentativas.compute(normalizar(email), (k, existente) -> {
            Tentativa tt = (existente == null) ? new Tentativa() : existente;
            tt.ultimaAtividade = agora;
            // Bloqueio anterior expirou -> recomeca a contagem do zero.
            if (tt.bloqueadoAte != 0 && agora >= tt.bloqueadoAte) {
                tt.contador = 0;
                tt.bloqueadoAte = 0;
            }
            // Ainda bloqueado -> nao incrementa.
            if (tt.bloqueadoAte > agora) {
                return tt;
            }
            tt.contador++;
            if (tt.contador >= MAX_TENTATIVAS) {
                tt.bloqueadoAte = agora + BLOQUEIO_DURACAO_MS;
            }
            return tt;
        });
        if (t.bloqueadoAte > agora) return 0;
        return Math.max(0, MAX_TENTATIVAS - t.contador);
    }

    /** Login bem-sucedido: zera o historico da conta. */
    public void loginSucesso(String email) {
        tentativas.remove(normalizar(email));
    }

    private void limparSeNecessario() {
        long agora = System.currentTimeMillis();
        if (agora - ultimaLimpeza > CLEANUP_INTERVAL_MS) {
            ultimaLimpeza = agora;
            tentativas.entrySet().removeIf(e -> {
                Tentativa t = e.getValue();
                boolean bloqueado = t.bloqueadoAte > agora;
                boolean ocioso = agora - t.ultimaAtividade > BLOQUEIO_DURACAO_MS;
                return !bloqueado && ocioso;
            });
        }
    }

    private static class Tentativa {
        int contador = 0;
        long bloqueadoAte = 0; // epoch ms; 0 = nunca bloqueado
        long ultimaAtividade = System.currentTimeMillis();
    }
}
