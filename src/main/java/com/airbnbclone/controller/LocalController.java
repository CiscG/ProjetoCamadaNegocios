package com.airbnbclone.controller;

import com.airbnbclone.dto.LocalRequest;
import com.airbnbclone.dto.LocalResponse;
import com.airbnbclone.dto.OcupacaoResponse;
import com.airbnbclone.service.LocalService;
import com.airbnbclone.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LocalController {

    private final LocalService localService;
    private final ReservaService reservaService;

    public LocalController(LocalService localService, ReservaService reservaService) {
        this.localService = localService;
        this.reservaService = reservaService;
    }

    @GetMapping("/locais")
    public ResponseEntity<?> listar(
            @RequestParam(required = false) String cidade,
            @RequestParam(name = "preco_max", required = false) String precoMax,
            @RequestParam(name = "anfitriao_id", required = false) String anfitriaoId) {
        List<LocalResponse> locais = localService.listar(cidade, precoMax, anfitriaoId);
        return ResponseEntity.ok(locais);
    }

    @PostMapping("/locais")
    public ResponseEntity<?> criar(@RequestBody LocalRequest req) {
        LocalResponse local = localService.criar(req);
        return ResponseEntity.status(201).body(Map.of("local", local));
    }

    @GetMapping("/locais/{id}/ocupacao")
    public ResponseEntity<?> ocupacao(@PathVariable String id) {
        List<OcupacaoResponse> ocupacao = reservaService.ocupacao(id);
        return ResponseEntity.ok(ocupacao);
    }
}
