package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.dto.JwtResposta;
import com.lfclothing.lfclothing.dto.LoginRequisicao;
import com.lfclothing.lfclothing.dto.CadastroRequisicao;
import com.lfclothing.lfclothing.model.Role;
import com.lfclothing.lfclothing.model.Usuario;
import com.lfclothing.lfclothing.repository.UsuarioRepository;
import com.lfclothing.lfclothing.security.JwtUtils;
import com.lfclothing.lfclothing.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import com.lfclothing.lfclothing.security.InputSanitizer;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/autenticacao")
public class AutenticacaoController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AutenticacaoController.class);

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AutenticacaoController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository,
                          PasswordEncoder encoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> autenticarUsuario(@Valid @RequestBody LoginRequisicao loginRequisicao,
                                                HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequisicao.email(), loginRequisicao.senha()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> papeis = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        jwtUtils.setAuthCookies(response, userDetails.getEmail());

        return ResponseEntity.ok(new JwtResposta(
                userDetails.getId(),
                userDetails.getNome(),
                userDetails.getEmail(),
                papeis));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtUtils.getTokenFromCookie(request, JwtUtils.REFRESH_COOKIE);

        if (refreshToken == null || !jwtUtils.validateJwtToken(refreshToken)) {
            jwtUtils.clearAuthCookies(response);
            return ResponseEntity.status(401).body("Sessao expirada. Faca login novamente.");
        }

        String email = jwtUtils.getUserNameFromJwtToken(refreshToken);
        jwtUtils.setAuthCookies(response, email);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        jwtUtils.clearAuthCookies(response);
        return ResponseEntity.ok("Logout realizado com sucesso.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Nao autenticado.");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> papeis = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResposta(
                userDetails.getId(),
                userDetails.getNome(),
                userDetails.getEmail(),
                papeis));
    }

    @PutMapping("/atualizar")
    public ResponseEntity<?> atualizarUsuario(@RequestBody Map<String, String> dados, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Não autenticado.");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findByEmail(userDetails.getEmail())
                .orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuário não encontrado.");
        }

        String nome = InputSanitizer.sanitizeText(dados.get("nome"));
        if (nome != null && !nome.isBlank()) {
            usuario.setNome(nome);
        }

        String senhaAtual = dados.get("senhaAtual");
        String novaSenha = dados.get("novaSenha");
        if (senhaAtual != null && novaSenha != null && !senhaAtual.isEmpty() && !novaSenha.isEmpty()) {
            if (!encoder.matches(senhaAtual, usuario.getSenha())) {
                logger.warn("Tentativa de troca de senha com senha incorreta para usuario: {}", usuario.getEmail());
                return ResponseEntity.badRequest().body("Senha atual incorreta.");
            }
            if (novaSenha.length() < 8) {
                return ResponseEntity.badRequest().body("A nova senha deve ter no mínimo 8 caracteres.");
            }
            if (novaSenha.length() > 100) {
                return ResponseEntity.badRequest().body("Senha muito longa.");
            }
            usuario.setSenha(encoder.encode(novaSenha));
        }

        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Dados atualizados com sucesso!");
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody CadastroRequisicao cadastroRequisicao) {
        String nomeSanitizado = InputSanitizer.sanitizeText(cadastroRequisicao.nome());
        if (nomeSanitizado == null || nomeSanitizado.isBlank()) {
            return ResponseEntity.badRequest().body("Nome invalido.");
        }

        // Resposta genérica para não revelar se o email já existe (anti-enumeração)
        if (usuarioRepository.existsByEmail(cadastroRequisicao.email())) {
            // Simula tempo de processamento do bcrypt para não revelar via timing
            encoder.encode("dummy-timing-equalization");
            return ResponseEntity.ok("Se este email nao estiver cadastrado, sua conta foi criada. Tente fazer login.");
        }

        Usuario usuario = new Usuario(nomeSanitizado, cadastroRequisicao.email(),
                encoder.encode(cadastroRequisicao.senha()), Role.ROLE_USER);

        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Se este email nao estiver cadastrado, sua conta foi criada. Tente fazer login.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrar-admin")
    public ResponseEntity<?> registrarAdmin(@Valid @RequestBody CadastroRequisicao cadastroRequisicao) {
        if (usuarioRepository.existsByEmail(cadastroRequisicao.email())) {
            return ResponseEntity.badRequest().body("Erro: Email ja esta em uso!");
        }

        Usuario usuario = new Usuario(cadastroRequisicao.nome(), cadastroRequisicao.email(),
                encoder.encode(cadastroRequisicao.senha()), Role.ROLE_ADMIN);

        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Administrador registrado com sucesso!");
    }
}
