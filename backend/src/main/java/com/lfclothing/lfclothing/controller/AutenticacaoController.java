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
import com.lfclothing.lfclothing.service.RefreshTokenService;

import java.time.Instant;
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
    private final RefreshTokenService refreshTokenService;

    public AutenticacaoController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository,
                          PasswordEncoder encoder, JwtUtils jwtUtils, RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
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

        String refreshJwt = jwtUtils.setAuthCookies(response, userDetails.getEmail());
        Instant expiracao = Instant.now().plusMillis(jwtUtils.getRefreshExpirationMs());
        refreshTokenService.salvar(refreshJwt, userDetails.getEmail(), expiracao);

        return ResponseEntity.ok(new JwtResposta(
                userDetails.getId(),
                userDetails.getNome(),
                userDetails.getEmail(),
                papeis));
    }

    @PostMapping("/refresh")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtUtils.getTokenFromCookie(request, JwtUtils.REFRESH_COOKIE);

        if (refreshToken == null || !jwtUtils.validateJwtToken(refreshToken)) {
            jwtUtils.clearAuthCookies(response);
            return ResponseEntity.status(401).body("Sessao expirada. Faca login novamente.");
        }

        // Valida se o token existe no banco e nao foi revogado
        var tokenValido = refreshTokenService.validar(refreshToken);
        if (tokenValido.isEmpty()) {
            // Token valido pelo JWT mas revogado no banco — possivel roubo de token
            String email = jwtUtils.getUserNameFromJwtToken(refreshToken);
            refreshTokenService.revogarTodos(email);
            logger.warn("Refresh token reutilizado (possivel roubo) para: {}", email);
            jwtUtils.clearAuthCookies(response);
            return ResponseEntity.status(401).body("Sessao invalidada por seguranca. Faca login novamente.");
        }

        String email = jwtUtils.getUserNameFromJwtToken(refreshToken);
        String novoRefreshJwt = jwtUtils.setAuthCookies(response, email);
        Instant expiracao = Instant.now().plusMillis(jwtUtils.getRefreshExpirationMs());
        refreshTokenService.rotacionar(refreshToken, novoRefreshJwt, email, expiracao);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Revoga todos os refresh tokens do usuario
        String refreshToken = jwtUtils.getTokenFromCookie(request, JwtUtils.REFRESH_COOKIE);
        if (refreshToken != null && jwtUtils.validateJwtToken(refreshToken)) {
            String email = jwtUtils.getUserNameFromJwtToken(refreshToken);
            refreshTokenService.revogarTodos(email);
        }
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
            if (senhaAtual.length() > 100) {
                return ResponseEntity.badRequest().body("Senha invalida.");
            }
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
            // Revogar todos os refresh tokens ao trocar senha (invalida outras sessoes)
            refreshTokenService.revogarTodos(usuario.getEmail());
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

    @DeleteMapping("/excluir-conta")
    public ResponseEntity<?> excluirConta(@RequestBody Map<String, String> dados, Authentication authentication,
                                           HttpServletResponse response) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Nao autenticado.");
        }

        String senha = dados.get("senha");
        if (senha == null || senha.isEmpty()) {
            return ResponseEntity.badRequest().body("Senha e obrigatoria para confirmar a exclusao.");
        }
        if (senha.length() > 100) {
            return ResponseEntity.badRequest().body("Senha invalida.");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findByEmail(userDetails.getEmail()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuario nao encontrado.");
        }

        if (!encoder.matches(senha, usuario.getSenha())) {
            return ResponseEntity.badRequest().body("Senha incorreta.");
        }

        // Anonimiza dados pessoais (LGPD) - mantém registro para fins fiscais
        String anonId = "deleted_" + usuario.getId();
        usuario.setNome("Usuario Removido");
        usuario.setEmail(anonId + "@deleted.local");
        usuario.setSenha(encoder.encode(java.util.UUID.randomUUID().toString()));
        usuarioRepository.save(usuario);

        logger.info("Conta anonimizada (LGPD): userId={}", usuario.getId());

        refreshTokenService.revogarTodos(userDetails.getEmail());
        jwtUtils.clearAuthCookies(response);
        return ResponseEntity.ok("Conta excluida com sucesso. Seus dados pessoais foram removidos.");
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
