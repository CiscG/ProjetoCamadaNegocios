package com.airbnbclone.seed;

import com.airbnbclone.model.Datas;
import com.airbnbclone.model.Endereco;
import com.airbnbclone.model.Local;
import com.airbnbclone.model.Reserva;
import com.airbnbclone.model.Usuario;
import com.airbnbclone.repository.LocalRepository;
import com.airbnbclone.repository.ReservaRepository;
import com.airbnbclone.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class SeedDataLoader implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedDataLoader.class);
    private static final String DEMO_PASSWORD = "123456";

    private final UsuarioRepository usuarioRepo;
    private final LocalRepository localRepo;
    private final ReservaRepository reservaRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public SeedDataLoader(UsuarioRepository usuarioRepo, LocalRepository localRepo,
                          ReservaRepository reservaRepo) {
        this.usuarioRepo = usuarioRepo;
        this.localRepo = localRepo;
        this.reservaRepo = reservaRepo;
    }

    @Override
    public void run(ApplicationArguments args) {
        String senhaHash = passwordEncoder.encode(DEMO_PASSWORD);

        // Seed usuarios (idempotent — only insert if missing senha_hash)
        List<UsuarioSeed> seeds = List.of(
                new UsuarioSeed("65df00000000000000000001", "Carlos Oliveira", "carlos@email.com",
                        "anfitriao", LocalDateTime.of(2024, 5, 10, 0, 0)),
                new UsuarioSeed("65df00000000000000000002", "Maria Souza", "maria@email.com",
                        "hospede", LocalDateTime.of(2025, 2, 15, 0, 0)),
                new UsuarioSeed("65df00000000000000000003", "Ana Martins", "ana@email.com",
                        "ambos", LocalDateTime.of(2026, 1, 20, 0, 0))
        );

        for (UsuarioSeed s : seeds) {
            Optional<Usuario> existente = usuarioRepo.findById(s.id());
            if (existente.isEmpty() || existente.get().getSenhaHash() == null) {
                Usuario u = new Usuario();
                u.setId(s.id());
                u.setNome(s.nome());
                u.setEmail(s.email());
                u.setSenhaHash(senhaHash);
                u.setTipo(s.tipo());
                u.setDataCadastro(s.dataCadastro());
                usuarioRepo.save(u);
            }
        }

        // Seed locais (only if collection is empty)
        if (localRepo.count() == 0) {
            Local l1 = local("75ef00000000000000000001", "65df00000000000000000001",
                    "Studio Moderno - Copacabana", "A 2 minutos da praia com Wi-Fi de alta velocidade.",
                    220.0, new Endereco("Rio de Janeiro", "RJ", "Brasil"),
                    List.of("Wi-Fi", "Ar Condicionado", "Elevador"),
                    LocalDateTime.of(2026, 3, 12, 0, 0));

            Local l2 = local("75ef00000000000000000002", "65df00000000000000000001",
                    "Casa de Campo com Lareira", "Ideal para fins de semana relaxantes na serra.",
                    450.0, new Endereco("Petropolis", "RJ", "Brasil"),
                    List.of("Piscina", "Lareira", "Churrasqueira"),
                    LocalDateTime.of(2026, 3, 20, 0, 0));

            Local l3 = local("75ef00000000000000000003", "65df00000000000000000003",
                    "Loft Minimalista - Vila Madalena", "Perto de bares, galerias de arte e metro.",
                    310.0, new Endereco("Sao Paulo", "SP", "Brasil"),
                    List.of("Wi-Fi", "Academia", "Varanda"),
                    LocalDateTime.of(2026, 4, 2, 0, 0));

            localRepo.saveAll(List.of(l1, l2, l3));
        }

        // Seed reservas (only if collection is empty)
        if (reservaRepo.count() == 0) {
            Reserva r1 = reserva("85ff00000000000000000001", "75ef00000000000000000001",
                    "65df00000000000000000002",
                    LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 5),
                    880.0, "confirmada", LocalDateTime.of(2026, 4, 10, 0, 0));

            Reserva r2 = reserva("85ff00000000000000000002", "75ef00000000000000000003",
                    "65df00000000000000000002",
                    LocalDate.of(2026, 7, 10), LocalDate.of(2026, 7, 12),
                    620.0, "pendente", LocalDateTime.of(2026, 4, 11, 0, 0));

            reservaRepo.saveAll(List.of(r1, r2));
        }

        log.info("Dados de demonstracao prontos. Usuarios: carlos@email.com / maria@email.com / ana@email.com | Senha: {}", DEMO_PASSWORD);
    }

    private Local local(String id, String anfitriaoId, String titulo, String descricao,
                        Double preco, Endereco endereco, List<String> comodidades, LocalDateTime data) {
        Local l = new Local();
        l.setId(id);
        l.setAnfitriaoId(anfitriaoId);
        l.setTitulo(titulo);
        l.setDescricao(descricao);
        l.setPrecoPorNoite(preco);
        l.setEndereco(endereco);
        l.setComodidades(comodidades);
        l.setDataCadastro(data);
        return l;
    }

    private Reserva reserva(String id, String localId, String hospedeId,
                            LocalDate checkin, LocalDate checkout,
                            Double valor, String status, LocalDateTime dataReserva) {
        Reserva r = new Reserva();
        r.setId(id);
        r.setLocalId(localId);
        r.setHospedeId(hospedeId);
        r.setDatas(new Datas(checkin, checkout));
        r.setValorTotal(valor);
        r.setStatus(status);
        r.setDataReserva(dataReserva);
        return r;
    }

    private record UsuarioSeed(String id, String nome, String email, String tipo, LocalDateTime dataCadastro) {}
}
