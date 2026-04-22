package com.airbnbclone.dto;

import com.airbnbclone.model.Endereco;

import java.util.List;

public record LocalRequest(
        String anfitriaoId,
        String titulo,
        String descricao,
        Double precoPorNoite,
        Endereco endereco,
        List<String> comodidades
) {}
