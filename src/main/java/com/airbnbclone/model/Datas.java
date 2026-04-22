package com.airbnbclone.model;

import java.time.LocalDate;

public class Datas {
    private LocalDate checkin;
    private LocalDate checkout;

    public Datas() {}

    public Datas(LocalDate checkin, LocalDate checkout) {
        this.checkin = checkin;
        this.checkout = checkout;
    }

    public LocalDate getCheckin() { return checkin; }
    public void setCheckin(LocalDate checkin) { this.checkin = checkin; }
    public LocalDate getCheckout() { return checkout; }
    public void setCheckout(LocalDate checkout) { this.checkout = checkout; }
}
