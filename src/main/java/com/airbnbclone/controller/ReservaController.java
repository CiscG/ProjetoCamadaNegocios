package com.airbnbclone.controller;

import com.airbnbclone.dto.ReservaRequest;
import com.airbnbclone.dto.ReservaResponse;
import com.airbnbclone.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping("/reservas")
    public ResponseEntity<?> listar(
            @RequestParam(name = "hospede_id", required = false) String hospedeId,
            @RequestParam(name = "anfitriao_id", required = false) String anfitriaoId,
            @RequestParam(required = false) String status) {
        List<ReservaResponse> reservas = reservaService.listar(hospedeId, anfitriaoId, status);
        return ResponseEntity.ok(reservas);
    }

    @PostMapping("/reservas")
    public ResponseEntity<?> criar(@RequestBody ReservaRequest req) {
        ReservaResponse reserva = reservaService.criar(req);
        return ResponseEntity.status(201).body(Map.of(
                "mensagem", "Reserva confirmada!",
                "reserva", reserva
        ));
    }
}
