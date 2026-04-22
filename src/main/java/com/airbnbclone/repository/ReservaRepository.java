package com.airbnbclone.repository;

import com.airbnbclone.model.Reserva;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservaRepository extends MongoRepository<Reserva, String> {
}
