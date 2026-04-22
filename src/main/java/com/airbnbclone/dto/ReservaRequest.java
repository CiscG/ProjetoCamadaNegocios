package com.airbnbclone.dto;

public record ReservaRequest(
        String localId,
        String hospedeId,
        String checkin,
        String checkout
) {}
