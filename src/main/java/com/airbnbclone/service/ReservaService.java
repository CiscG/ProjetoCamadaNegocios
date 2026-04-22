package com.airbnbclone.service;

import com.airbnbclone.dto.LocalResponse;
import com.airbnbclone.dto.OcupacaoResponse;
import com.airbnbclone.dto.ReservaRequest;
import com.airbnbclone.dto.ReservaResponse;
import com.airbnbclone.model.Datas;
import com.airbnbclone.model.Local;
import com.airbnbclone.model.Reserva;
import com.airbnbclone.model.Usuario;
import com.airbnbclone.repository.LocalRepository;
import com.airbnbclone.repository.ReservaRepository;
import com.airbnbclone.repository.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final LocalRepository localRepository;
    private final UsuarioRepository usuarioRepository;
    private final MongoTemplate mongoTemplate;
    private final LocalService localService;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public ReservaService(ReservaRepository reservaRepository, LocalRepository localRepository,
                          UsuarioRepository usuarioRepository, MongoTemplate mongoTemplate,
                          LocalService localService) {
        this.reservaRepository = reservaRepository;
        this.localRepository = localRepository;
        this.usuarioRepository = usuarioRepository;
        this.mongoTemplate = mongoTemplate;
        this.localService = localService;
    }

    public ReservaResponse criar(ReservaRequest req) {
        LocalDate checkin = LocalDate.parse(req.checkin(), DATE_FMT);
        LocalDate checkout = LocalDate.parse(req.checkout(), DATE_FMT);

        if (!checkout.isAfter(checkin))
            throw new IllegalArgumentException("Checkout deve ser posterior ao checkin.");

        Local local = localRepository.findById(req.localId())
                .orElseThrow(() -> new IllegalArgumentException("Imovel nao encontrado."));

        Usuario hospede = usuarioRepository.findById(req.hospedeId())
                .orElseThrow(() -> new IllegalArgumentException("Hospede nao encontrado."));
        if (!Set.of("hospede", "ambos").contains(hospede.getTipo()))
            throw new IllegalArgumentException("Somente hospedes podem fazer reservas.");

        Query conflictQuery = new Query(
                Criteria.where("local_id").is(req.localId())
                        .and("status").is("confirmada")
                        .and("datas.checkin").lt(checkout)
                        .and("datas.checkout").gt(checkin)
        );
        if (mongoTemplate.exists(conflictQuery, Reserva.class))
            throw new ConflictException("Este local ja esta reservado para estas datas.");

        long noites = ChronoUnit.DAYS.between(checkin, checkout);

        Reserva reserva = new Reserva();
        reserva.setLocalId(req.localId());
        reserva.setHospedeId(req.hospedeId());
        reserva.setDatas(new Datas(checkin, checkout));
        reserva.setValorTotal(local.getPrecoPorNoite() * noites);
        reserva.setStatus("confirmada");
        reserva.setDataReserva(LocalDateTime.now());

        Reserva salva = reservaRepository.save(reserva);

        Map<String, Usuario> anfitrioes = usuarioRepository.findById(local.getAnfitriaoId())
                .map(u -> Map.of(u.getId(), u)).orElse(Map.of());
        LocalResponse localResponse = localService.toResponse(local, anfitrioes);

        return toResponse(salva, localResponse);
    }

    public List<ReservaResponse> listar(String hospedeId, String anfitriaoId, String status) {
        Query query = new Query();
        List<Criteria> criterias = new ArrayList<>();

        if (hospedeId != null && !hospedeId.isBlank())
            criterias.add(Criteria.where("hospede_id").is(hospedeId));
        if (status != null && !status.isBlank())
            criterias.add(Criteria.where("status").is(status));

        if (anfitriaoId != null && !anfitriaoId.isBlank()) {
            List<Local> locaisAnfitriao = localRepository.findByAnfitriaoId(anfitriaoId);
            if (locaisAnfitriao.isEmpty()) return List.of();
            List<String> localIds = locaisAnfitriao.stream().map(Local::getId).toList();
            criterias.add(Criteria.where("local_id").in(localIds));
        }

        if (!criterias.isEmpty())
            query.addCriteria(new Criteria().andOperator(criterias.toArray(new Criteria[0])));

        query.with(Sort.by(Sort.Direction.DESC, "data_reserva"));

        List<Reserva> reservas = mongoTemplate.find(query, Reserva.class);

        Set<String> localIds = reservas.stream().map(Reserva::getLocalId).collect(Collectors.toSet());
        Map<String, Local> locaisMap = localRepository.findAllById(localIds)
                .stream().collect(Collectors.toMap(Local::getId, l -> l));

        Set<String> anfitriaoIds = locaisMap.values().stream()
                .map(Local::getAnfitriaoId).collect(Collectors.toSet());
        Map<String, Usuario> anfitrioes = usuarioRepository.findAllById(anfitriaoIds)
                .stream().collect(Collectors.toMap(Usuario::getId, u -> u));

        return reservas.stream().map(r -> {
            Local l = locaisMap.get(r.getLocalId());
            LocalResponse localResp = l != null ? localService.toResponse(l, anfitrioes) : null;
            return toResponse(r, localResp);
        }).collect(Collectors.toList());
    }

    public List<OcupacaoResponse> ocupacao(String localId) {
        Query query = new Query(
                Criteria.where("local_id").is(localId).and("status").is("confirmada")
        );
        return mongoTemplate.find(query, Reserva.class).stream()
                .map(r -> new OcupacaoResponse(
                        r.getDatas().getCheckin().format(DATE_FMT),
                        r.getDatas().getCheckout().format(DATE_FMT)))
                .collect(Collectors.toList());
    }

    public ReservaResponse toResponse(Reserva reserva, LocalResponse local) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getLocalId(),
                reserva.getHospedeId(),
                reserva.getDatas().getCheckin().format(DATE_FMT),
                reserva.getDatas().getCheckout().format(DATE_FMT),
                reserva.getValorTotal(),
                reserva.getStatus(),
                reserva.getDataReserva().format(DATE_FMT),
                local
        );
    }
}
