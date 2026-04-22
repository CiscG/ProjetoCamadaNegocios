package com.airbnbclone.controller;

import com.airbnbclone.dto.LoginRequest;
import com.airbnbclone.model.Usuario;
import com.airbnbclone.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {

    private final UsuarioService usuarioService;

    public LoginController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.email() == null || req.email().isBlank() || req.senha() == null || req.senha().isBlank())
            return ResponseEntity.badRequest().body(Map.of("erro", "Informe email e senha para entrar."));

        Optional<Usuario> usuario = usuarioService.autenticar(req.email(), req.senha());
        if (usuario.isEmpty())
            return ResponseEntity.status(401).body(Map.of("erro", "Email ou senha invalidos."));

        Usuario u = usuario.get();
        return ResponseEntity.ok(Map.of("usuario", Map.of(
                "id", u.getId(),
                "nome", u.getNome(),
                "email", u.getEmail(),
                "tipo", u.getTipo()
        )));
    }
}
