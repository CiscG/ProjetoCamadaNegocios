package com.airbnbclone.service;

import com.airbnbclone.model.Usuario;
import com.airbnbclone.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Optional<Usuario> autenticar(String email, String senha) {
        Optional<Usuario> usuario = repository.findByEmail(email.trim().toLowerCase());
        if (usuario.isEmpty()) return Optional.empty();
        if (!passwordEncoder.matches(senha, usuario.get().getSenhaHash())) return Optional.empty();
        return usuario;
    }

    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }
}
