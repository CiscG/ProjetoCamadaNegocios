package com.airbnbclone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "locais")
public class Local {
    @Id
    private String id;
    @Field("anfitriao_id")
    private String anfitriaoId;
    private String titulo;
    private String descricao;
    @Field("preco_por_noite")
    private Double precoPorNoite;
    private Endereco endereco;
    private List<String> comodidades;
    @Field("data_cadastro")
    private LocalDateTime dataCadastro;

    public Local() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAnfitriaoId() { return anfitriaoId; }
    public void setAnfitriaoId(String anfitriaoId) { this.anfitriaoId = anfitriaoId; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Double getPrecoPorNoite() { return precoPorNoite; }
    public void setPrecoPorNoite(Double precoPorNoite) { this.precoPorNoite = precoPorNoite; }
    public Endereco getEndereco() { return endereco; }
    public void setEndereco(Endereco endereco) { this.endereco = endereco; }
    public List<String> getComodidades() { return comodidades; }
    public void setComodidades(List<String> comodidades) { this.comodidades = comodidades; }
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }
}
