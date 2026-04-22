package com.airbnbclone.cli;

import com.airbnbclone.dto.LocalRequest;
import com.airbnbclone.dto.LocalResponse;
import com.airbnbclone.dto.OcupacaoResponse;
import com.airbnbclone.dto.ReservaRequest;
import com.airbnbclone.dto.ReservaResponse;
import com.airbnbclone.model.Endereco;
import com.airbnbclone.model.Usuario;
import com.airbnbclone.service.ConflictException;
import com.airbnbclone.service.LocalService;
import com.airbnbclone.service.ReservaService;
import com.airbnbclone.service.UsuarioService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

@Component
public class CliRunner {

    private final UsuarioService usuarioService;
    private final LocalService localService;
    private final ReservaService reservaService;
    private final Scanner scanner = new Scanner(System.in);
    private Usuario usuarioLogado;

    public CliRunner(UsuarioService usuarioService, LocalService localService, ReservaService reservaService) {
        this.usuarioService = usuarioService;
        this.localService = localService;
        this.reservaService = reservaService;
    }

    public void executar() {
        cabecalho();
        boolean rodando = true;
        while (rodando) {
            exibirMenu();
            String opcao = scanner.nextLine().trim();
            System.out.println();
            switch (opcao) {
                case "1" -> login();
                case "2" -> listarImoveis();
                case "3" -> buscarPorCidade();
                case "4" -> verOcupacao();
                case "5" -> cadastrarImovel();
                case "6" -> fazerReserva();
                case "7" -> minhasReservas();
                case "8" -> minhasPropriedades();
                case "9" -> logout();
                case "0" -> { println("Ate logo!"); rodando = false; }
                default -> println("Opcao invalida. Tente novamente.");
            }
        }
    }

    // ──────────────── MENU ────────────────

    private void cabecalho() {
        println("╔══════════════════════════════════╗");
        println("║      AIRBNB CLONE - TERMINAL     ║");
        println("╚══════════════════════════════════╝");
    }

    private void exibirMenu() {
        String usuario = usuarioLogado != null
                ? usuarioLogado.getNome() + " [" + usuarioLogado.getTipo() + "]"
                : "Nao logado";
        println("\n─── Usuario: " + usuario + " ───");
        println("1. Login");
        println("2. Listar todos os imoveis");
        println("3. Buscar imoveis por cidade");
        println("4. Ver ocupacao de um imovel");
        if (isAnfitriao()) println("5. Cadastrar imovel");
        if (isHospede())   println("6. Fazer reserva");
        println("7. Minhas reservas");
        if (isAnfitriao()) println("8. Minhas propriedades");
        if (usuarioLogado != null) println("9. Logout");
        println("0. Sair");
        print("\nEscolha: ");
    }

    // ──────────────── ACOES ────────────────

    private void login() {
        if (usuarioLogado != null) { println("Voce ja esta logado como " + usuarioLogado.getNome() + "."); return; }
        print("Email: ");
        String email = scanner.nextLine().trim();
        print("Senha: ");
        String senha = scanner.nextLine().trim();

        Optional<Usuario> resultado = usuarioService.autenticar(email, senha);
        if (resultado.isPresent()) {
            usuarioLogado = resultado.get();
            println("Bem-vindo(a), " + usuarioLogado.getNome() + "!");
        } else {
            println("Email ou senha invalidos.");
        }
    }

    private void logout() {
        println("Ate logo, " + usuarioLogado.getNome() + "!");
        usuarioLogado = null;
    }

    private void listarImoveis() {
        List<LocalResponse> locais = localService.listar(null, null, null);
        if (locais.isEmpty()) { println("Nenhum imovel cadastrado."); return; }
        println("=== Imoveis disponíveis (" + locais.size() + ") ===");
        locais.forEach(this::imprimirLocal);
    }

    private void buscarPorCidade() {
        print("Cidade: ");
        String cidade = scanner.nextLine().trim();
        print("Preco maximo por noite (Enter para ignorar): ");
        String preco = scanner.nextLine().trim();

        List<LocalResponse> locais = localService.listar(cidade, preco.isEmpty() ? null : preco, null);
        if (locais.isEmpty()) { println("Nenhum imovel encontrado."); return; }
        println("=== Resultados em " + cidade + " (" + locais.size() + ") ===");
        locais.forEach(this::imprimirLocal);
    }

    private void verOcupacao() {
        print("ID do imovel: ");
        String id = scanner.nextLine().trim();
        List<OcupacaoResponse> ocupacao = reservaService.ocupacao(id);
        if (ocupacao.isEmpty()) { println("Nenhuma reserva confirmada para este imovel."); return; }
        println("=== Datas ocupadas ===");
        ocupacao.forEach(o -> println("  De " + o.desde() + " ate " + o.ate()));
    }

    private void cadastrarImovel() {
        if (!isAnfitriao()) { println("Acesso negado. Faca login como anfitriao."); return; }

        print("Titulo: ");
        String titulo = scanner.nextLine().trim();
        print("Descricao: ");
        String descricao = scanner.nextLine().trim();
        print("Preco por noite (R$): ");
        double preco;
        try { preco = Double.parseDouble(scanner.nextLine().trim()); }
        catch (NumberFormatException e) { println("Preco invalido."); return; }

        print("Cidade: ");
        String cidade = scanner.nextLine().trim();
        print("Estado (sigla): ");
        String estado = scanner.nextLine().trim();
        print("Pais: ");
        String pais = scanner.nextLine().trim();
        print("Comodidades (separadas por virgula): ");
        String comodidadesStr = scanner.nextLine().trim();

        List<String> comodidades = comodidadesStr.isBlank() ? List.of()
                : List.of(comodidadesStr.split(","));

        LocalRequest req = new LocalRequest(
                usuarioLogado.getId(), titulo, descricao, preco,
                new Endereco(cidade, estado, pais), comodidades);

        try {
            LocalResponse local = localService.criar(req);
            println("Imovel cadastrado com sucesso! ID: " + local.id());
        } catch (IllegalArgumentException e) {
            println("Erro: " + e.getMessage());
        }
    }

    private void fazerReserva() {
        if (!isHospede()) { println("Acesso negado. Faca login como hospede."); return; }

        List<LocalResponse> locais = localService.listar(null, null, null);
        if (locais.isEmpty()) { println("Nenhum imovel disponivel."); return; }

        println("=== Imoveis disponíveis ===");
        locais.forEach(this::imprimirLocal);

        print("ID do imovel: ");
        String localId = scanner.nextLine().trim();
        print("Data de checkin (YYYY-MM-DD): ");
        String checkin = scanner.nextLine().trim();
        print("Data de checkout (YYYY-MM-DD): ");
        String checkout = scanner.nextLine().trim();

        try {
            ReservaResponse reserva = reservaService.criar(
                    new ReservaRequest(localId, usuarioLogado.getId(), checkin, checkout));
            println("Reserva confirmada! ID: " + reserva.id());
            println("  Local: " + (reserva.local() != null ? reserva.local().titulo() : localId));
            println("  Checkin: " + reserva.checkin() + "  Checkout: " + reserva.checkout());
            println("  Valor total: R$ " + String.format("%.2f", reserva.valorTotal()));
        } catch (ConflictException e) {
            println("Conflito: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            println("Erro: " + e.getMessage());
        }
    }

    private void minhasReservas() {
        if (usuarioLogado == null) { println("Faca login primeiro."); return; }

        boolean isHospede = isHospede();
        boolean isAnfitriao = isAnfitriao();

        List<ReservaResponse> reservas;
        if (isHospede && !isAnfitriao) {
            reservas = reservaService.listar(usuarioLogado.getId(), null, null);
        } else if (isAnfitriao && !isHospede) {
            reservas = reservaService.listar(null, usuarioLogado.getId(), null);
        } else {
            // ambos: show both
            println("1. Como hospede  2. Como anfitriao");
            print("Escolha: ");
            String op = scanner.nextLine().trim();
            if ("2".equals(op))
                reservas = reservaService.listar(null, usuarioLogado.getId(), null);
            else
                reservas = reservaService.listar(usuarioLogado.getId(), null, null);
        }

        if (reservas.isEmpty()) { println("Nenhuma reserva encontrada."); return; }
        println("=== Reservas (" + reservas.size() + ") ===");
        reservas.forEach(this::imprimirReserva);
    }

    private void minhasPropriedades() {
        if (!isAnfitriao()) { println("Acesso negado. Faca login como anfitriao."); return; }
        List<LocalResponse> locais = localService.listar(null, null, usuarioLogado.getId());
        if (locais.isEmpty()) { println("Voce nao tem imoveis cadastrados."); return; }
        println("=== Seus imoveis (" + locais.size() + ") ===");
        locais.forEach(this::imprimirLocal);
    }

    // ──────────────── HELPERS ────────────────

    private void imprimirLocal(LocalResponse l) {
        println("──────────────────────────────");
        println("ID    : " + l.id());
        println("Titulo: " + l.titulo());
        println("Local : " + l.endereco().getCidade() + " - " + l.endereco().getEstado() + ", " + l.endereco().getPais());
        println("Preco : R$ " + String.format("%.2f", l.precoPorNoite()) + "/noite");
        println("Anfitrio: " + l.anfitriaoNome());
        if (l.comodidades() != null && !l.comodidades().isEmpty())
            println("Comodidades: " + String.join(", ", l.comodidades()));
        println("Descricao: " + l.descricao());
    }

    private void imprimirReserva(ReservaResponse r) {
        println("──────────────────────────────");
        println("ID       : " + r.id());
        String tituloLocal = r.local() != null ? r.local().titulo() : r.localId();
        println("Imovel   : " + tituloLocal);
        println("Checkin  : " + r.checkin() + "  Checkout: " + r.checkout());
        println("Valor    : R$ " + String.format("%.2f", r.valorTotal()));
        println("Status   : " + r.status());
    }

    private boolean isAnfitriao() {
        return usuarioLogado != null && (usuarioLogado.getTipo().equals("anfitriao")
                || usuarioLogado.getTipo().equals("ambos"));
    }

    private boolean isHospede() {
        return usuarioLogado != null && (usuarioLogado.getTipo().equals("hospede")
                || usuarioLogado.getTipo().equals("ambos"));
    }

    private void println(String msg) { System.out.println(msg); }
    private void print(String msg)   { System.out.print(msg); System.out.flush(); }
}
