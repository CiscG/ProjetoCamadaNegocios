package com.airbnbclone.dto;

public record ReservaResponse(
        String id,
        String localId,
        String hospedeId,
        String checkin,
        String checkout,
        Double valorTotal,
        String status,
        String dataReserva,
        LocalResponse local
) {}
