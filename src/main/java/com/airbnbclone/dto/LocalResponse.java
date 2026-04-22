package com.airbnbclone.dto;

import com.airbnbclone.model.Endereco;

import java.util.List;

public record LocalResponse(
        String id,
        String anfitriaoId,
        String anfitriaoNome,
        String titulo,
        String descricao,
        Double precoPorNoite,
        Endereco endereco,
        List<String> comodidades,
        String dataCadastro
) {}
