package com.airbnbclone.service;

import com.airbnbclone.dto.LocalRequest;
import com.airbnbclone.dto.LocalResponse;
import com.airbnbclone.model.Endereco;
import com.airbnbclone.model.Local;
import com.airbnbclone.model.Usuario;
import com.airbnbclone.repository.LocalRepository;
import com.airbnbclone.repository.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocalService {

    private final LocalRepository localRepository;
    private final UsuarioRepository usuarioRepository;
    private final MongoTemplate mongoTemplate;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public LocalService(LocalRepository localRepository, UsuarioRepository usuarioRepository,
                        MongoTemplate mongoTemplate) {
        this.localRepository = localRepository;
        this.usuarioRepository = usuarioRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public List<LocalResponse> listar(String cidade, String precoMax, String anfitriaoId) {
        Query query = new Query();
        List<Criteria> criterias = new ArrayList<>();

        if (cidade != null && !cidade.isBlank())
            criterias.add(Criteria.where("endereco.cidade").regex("^" + cidade + "$", "i"));
        if (precoMax != null && !precoMax.isBlank())
            criterias.add(Criteria.where("preco_por_noite").lte(Double.parseDouble(precoMax)));
        if (anfitriaoId != null && !anfitriaoId.isBlank())
            criterias.add(Criteria.where("anfitriao_id").is(anfitriaoId));

        if (!criterias.isEmpty())
            query.addCriteria(new Criteria().andOperator(criterias.toArray(new Criteria[0])));

        query.with(Sort.by(Sort.Direction.DESC, "data_cadastro"));

        List<Local> locais = mongoTemplate.find(query, Local.class);

        Set<String> anfitriaoIds = locais.stream().map(Local::getAnfitriaoId).collect(Collectors.toSet());
        Map<String, Usuario> anfitrioes = usuarioRepository.findAllById(anfitriaoIds)
                .stream().collect(Collectors.toMap(Usuario::getId, u -> u));

        return locais.stream().map(l -> toResponse(l, anfitrioes)).collect(Collectors.toList());
    }

    public LocalResponse criar(LocalRequest req) {
        if (req.anfitriaoId() == null || req.titulo() == null || req.descricao() == null
                || req.precoPorNoite() == null || req.endereco() == null)
            throw new IllegalArgumentException("Campos obrigatorios ausentes.");

        Endereco end = req.endereco();
        if (end.getCidade() == null || end.getEstado() == null || end.getPais() == null)
            throw new IllegalArgumentException("Endereco incompleto: cidade, estado e pais sao obrigatorios.");

        Usuario anfitriao = usuarioRepository.findById(req.anfitriaoId())
                .orElseThrow(() -> new IllegalArgumentException("Anfitriao nao encontrado."));
        if (!Set.of("anfitriao", "ambos").contains(anfitriao.getTipo()))
            throw new IllegalArgumentException("Somente anfitrioes podem cadastrar imoveis.");

        Local local = new Local();
        local.setAnfitriaoId(req.anfitriaoId());
        local.setTitulo(req.titulo().strip());
        local.setDescricao(req.descricao().strip());
        local.setPrecoPorNoite(req.precoPorNoite());
        local.setEndereco(end);
        local.setComodidades(req.comodidades() != null
                ? req.comodidades().stream().filter(c -> !c.isBlank()).map(String::strip).toList()
                : List.of());
        local.setDataCadastro(LocalDateTime.now());

        Local salvo = localRepository.save(local);
        return toResponse(salvo, Map.of(anfitriao.getId(), anfitriao));
    }

    public Optional<Local> buscarEntidade(String id) {
        return localRepository.findById(id);
    }

    public LocalResponse toResponse(Local local, Map<String, Usuario> anfitrioes) {
        Usuario anfitriao = anfitrioes.get(local.getAnfitriaoId());
        return new LocalResponse(
                local.getId(),
                local.getAnfitriaoId(),
                anfitriao != null ? anfitriao.getNome() : "Anfitriao",
                local.getTitulo(),
                local.getDescricao(),
                local.getPrecoPorNoite(),
                local.getEndereco(),
                local.getComodidades(),
                local.getDataCadastro() != null ? local.getDataCadastro().format(DATE_FMT) : null
        );
    }
}
