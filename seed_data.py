from datetime import datetime

from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash

DEMO_PASSWORD = "123456"
DEMO_USERS = [
    {
        "_id": ObjectId("65df00000000000000000001"),
        "nome": "Carlos Oliveira",
        "email": "carlos@email.com",
        "tipo": "anfitriao",
        "data_cadastro": datetime(2024, 5, 10),
    },
    {
        "_id": ObjectId("65df00000000000000000002"),
        "nome": "Maria Souza",
        "email": "maria@email.com",
        "tipo": "hospede",
        "data_cadastro": datetime(2025, 2, 15),
    },
    {
        "_id": ObjectId("65df00000000000000000003"),
        "nome": "Ana Martins",
        "email": "ana@email.com",
        "tipo": "ambos",
        "data_cadastro": datetime(2026, 1, 20),
    },
]

SEED_LOCALS = [
    {
        "_id": ObjectId("75ef00000000000000000001"),
        "anfitriao_id": ObjectId("65df00000000000000000001"),
        "titulo": "Studio Moderno - Copacabana",
        "descricao": "A 2 minutos da praia com Wi-Fi de alta velocidade.",
        "preco_por_noite": 220.0,
        "endereco": {"cidade": "Rio de Janeiro", "estado": "RJ", "pais": "Brasil"},
        "comodidades": ["Wi-Fi", "Ar Condicionado", "Elevador"],
        "data_cadastro": datetime(2026, 3, 12),
    },
    {
        "_id": ObjectId("75ef00000000000000000002"),
        "anfitriao_id": ObjectId("65df00000000000000000001"),
        "titulo": "Casa de Campo com Lareira",
        "descricao": "Ideal para fins de semana relaxantes na serra.",
        "preco_por_noite": 450.0,
        "endereco": {"cidade": "Petropolis", "estado": "RJ", "pais": "Brasil"},
        "comodidades": ["Piscina", "Lareira", "Churrasqueira"],
        "data_cadastro": datetime(2026, 3, 20),
    },
    {
        "_id": ObjectId("75ef00000000000000000003"),
        "anfitriao_id": ObjectId("65df00000000000000000003"),
        "titulo": "Loft Minimalista - Vila Madalena",
        "descricao": "Perto de bares, galerias de arte e metro.",
        "preco_por_noite": 310.0,
        "endereco": {"cidade": "Sao Paulo", "estado": "SP", "pais": "Brasil"},
        "comodidades": ["Wi-Fi", "Academia", "Varanda"],
        "data_cadastro": datetime(2026, 4, 2),
    },
]

SEED_RESERVATIONS = [
    {
        "_id": ObjectId("85ff00000000000000000001"),
        "local_id": ObjectId("75ef00000000000000000001"),
        "hospede_id": ObjectId("65df00000000000000000002"),
        "datas": {
            "checkin": datetime(2026, 6, 1, 14, 0),
            "checkout": datetime(2026, 6, 5, 11, 0),
        },
        "valor_total": 880.0,
        "status": "confirmada",
        "data_reserva": datetime(2026, 4, 10),
    },
    {
        "_id": ObjectId("85ff00000000000000000002"),
        "local_id": ObjectId("75ef00000000000000000003"),
        "hospede_id": ObjectId("65df00000000000000000002"),
        "datas": {
            "checkin": datetime(2026, 7, 10, 14, 0),
            "checkout": datetime(2026, 7, 12, 11, 0),
        },
        "valor_total": 620.0,
        "status": "pendente",
        "data_reserva": datetime(2026, 4, 11),
    },
]


def build_users():
    usuarios = []
    for usuario in DEMO_USERS:
        usuarios.append(
            {
                **usuario,
                "senha_hash": generate_password_hash(DEMO_PASSWORD),
            }
        )
    return usuarios


def build_locals():
    return [dict(local) for local in SEED_LOCALS]


def build_reservations():
    return [dict(reserva) for reserva in SEED_RESERVATIONS]


_seed_done = False


def ensure_seed_data(db):
    global _seed_done
    if _seed_done:
        return

    usuarios = build_users()
    for usuario in usuarios:
        existente = db.usuarios.find_one({"_id": usuario["_id"]}, {"senha_hash": 1})
        if not existente or "senha_hash" not in existente:
            db.usuarios.replace_one({"_id": usuario["_id"]}, usuario, upsert=True)

    if db.locais.count_documents({}) == 0:
        db.locais.insert_many(build_locals())

    if db.reservas.count_documents({}) == 0:
        db.reservas.insert_many(build_reservations())

    _seed_done = True


def reset_seed_data(db):
    db.usuarios.delete_many({})
    db.locais.delete_many({})
    db.reservas.delete_many({})
    db.usuarios.insert_many(build_users())
    db.locais.insert_many(build_locals())
    db.reservas.insert_many(build_reservations())
