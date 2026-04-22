package com.airbnbclone.repository;

import com.airbnbclone.model.Local;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LocalRepository extends MongoRepository<Local, String> {
    List<Local> findByAnfitriaoId(String anfitriaoId);
}
