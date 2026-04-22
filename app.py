import os
from datetime import datetime, timezone

from bson.errors import InvalidId
from bson.objectid import ObjectId
from flask import Flask, jsonify, request, send_from_directory
from pymongo import MongoClient
from pymongo.errors import PyMongoError, OperationFailure
from werkzeug.security import check_password_hash

from seed_data import DEMO_PASSWORD, DEMO_USERS, ensure_seed_data

app = Flask(__name__, static_folder=os.path.join("FrontEnd", "dist"), static_url_path="")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client["airbnb_clone"]


def get_database():
    client.admin.command("ping")
    ensure_seed_data(db)
    return db


def para_data(data_str):
    # Converte a string para data e já define como UTC
    dt = datetime.strptime(data_str, "%Y-%m-%d")
    return dt.replace(tzinfo=timezone.utc)


def parse_object_id(value, field_name):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise ValueError(f"{field_name} invalido.")


# [MUDANÇA 2] Função para simular a extração de ID de um Token JWT.
# Em produção, o ID do usuário NUNCA vem do JSON da requisição, mas sim do Token de Autenticação.
def obter_usuario_autenticado():
    # Aqui simulamos passando o ID em um Header personalizado.
    # Se você usar o flask_jwt_extended no futuro, usaria: get_jwt_identity()
    user_id = request.headers.get("X-User-Id")
    
    # Fallback temporário para o payload (apenas para não quebrar seus testes atuais no Postman/FrontEnd)
    if not user_id and request.is_json:
        dados = request.get_json(silent=True) or {}
        user_id = dados.get("hospede_id") or dados.get("anfitriao_id")

    if not user_id:
        raise ValueError("Não autorizado. Envie o token/header de autenticação.")
    
    return parse_object_id(user_id, "usuario_autenticado")


def serialize_user(usuario):
    return {
        "id": str(usuario["_id"]),
        "nome": usuario["nome"],
        "email": usuario["email"],
        "tipo": usuario["tipo"],
    }


def serialize_local(local, anfitrioes=None):
    anfitriao = (anfitrioes or {}).get(local["anfitriao_id"])
    return {
        "id": str(local["_id"]),
        "anfitriao_id": str(local["anfitriao_id"]),
        "anfitriao_nome": anfitriao["nome"] if anfitriao else "Anfitriao",
        "titulo": local["titulo"],
        "descricao": local["descricao"],
        "preco_por_noite": float(local["preco_por_noite"]),
        "endereco": {
            "cidade": local["endereco"]["cidade"],
            "estado": local["endereco"]["estado"],
            "pais": local["endereco"]["pais"]
        },
        "comodidades": local.get("comodidades", []),
        "data_cadastro": local.get("data_cadastro", datetime.now(timezone.utc)).strftime("%Y-%m-%d"),
    }


def serialize_reserva(reserva, local=None):
    dados = reserva["datas"]
    resposta = {
        "id": str(reserva["_id"]),
        "local_id": str(reserva["local_id"]),
        "hospede_id": str(reserva["hospede_id"]),
        "checkin": dados["checkin"].strftime("%Y-%m-%d"),
        "checkout": dados["checkout"].strftime("%Y-%m-%d"),
        "valor_total": float(reserva["valor_total"]),
        "status": reserva["status"],
        "data_reserva": reserva.get("data_reserva", datetime.now(timezone.utc)).strftime("%Y-%m-%d"),
    }
    if local:
        resposta["local"] = serialize_local(local)
    return resposta


@app.errorhandler(PyMongoError)
def handle_mongo_error(error):
    return jsonify(
        {
            "erro": "Banco de dados indisponivel. Verifique a conexao com o MongoDB.",
            "detalhe": str(error),
        }
    ), 503


@app.errorhandler(ValueError)
def handle_value_error(error):
    return jsonify({"erro": str(error)}), 400


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    dist = os.path.join(app.root_path, "FrontEnd", "dist")
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    return send_from_directory(dist, "index.html")


@app.route("/api/login", methods=["POST"])
def login():
    database = get_database()
    dados = request.get_json(silent=True) or {}
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    if not email or not senha:
        raise ValueError("Informe email e senha para entrar.")

    usuario = database.usuarios.find_one({"email": email})
    if not usuario or not check_password_hash(usuario.get("senha_hash", ""), senha):
        return jsonify({"erro": "Email ou senha invalidos."}), 401

    return jsonify({"usuario": serialize_user(usuario)})


@app.route("/api/locais", methods=["GET", "POST"])
def locais():
    database = get_database()

    if request.method == "POST":
        dados = request.get_json(silent=True) or {}
        
        # [MUDANÇA 2] Pegando o ID pela função de autenticação, não pelo payload cru
        anfitriao_id = obter_usuario_autenticado()

        for campo in ("titulo", "descricao", "preco_por_noite", "endereco"):
            if not dados.get(campo):
                raise ValueError(f"Campo obrigatorio ausente: {campo}.")

        anfitriao = database.usuarios.find_one({"_id": anfitriao_id})
        if not anfitriao or anfitriao["tipo"] not in {"anfitriao", "ambos"}:
            raise ValueError("Somente anfitrioes podem cadastrar imoveis.")

        endereco = dados["endereco"]
        for campo in ("cidade", "estado", "pais"):
            if not endereco.get(campo):
                raise ValueError(f"Endereco incompleto. Campo obrigatorio: {campo}.")

        novo_local = {
            "anfitriao_id": anfitriao_id,
            "titulo": dados["titulo"].strip(),
            "descricao": dados["descricao"].strip(),
            "preco_por_noite": float(dados["preco_por_noite"]),
            "endereco": {
                "cidade": endereco["cidade"].strip(),
                "estado": endereco["estado"].strip(),
                "pais": endereco["pais"].strip(),
                # [MUDANÇA 3] Campo extra em minúsculo dedicado apenas para busca indexada rápida
                "cidade_busca": endereco["cidade"].strip().lower() 
            },
            "comodidades": [item.strip() for item in dados.get("comodidades", []) if item.strip()],
            # [MUDANÇA 5] Usando UTC para salvar a data, evitando problemas de fuso horário
            "data_cadastro": datetime.now(timezone.utc),
        }

        resultado = database.locais.insert_one(novo_local)
        novo_local["_id"] = resultado.inserted_id
        return jsonify({"local": serialize_local(novo_local, {anfitriao_id: anfitriao})}), 201

    cidade = request.args.get("cidade", "").strip()
    preco_max = request.args.get("preco_max", "").strip()
    anfitriao_id_query = request.args.get("anfitriao_id", "").strip()

    filtro = {}
    if cidade:
        # [MUDANÇA 3] Busca exata direta usando o campo padronizado, sem usar Regex lenta
        filtro["endereco.cidade_busca"] = cidade.lower()
    if preco_max:
        filtro["preco_por_noite"] = {"$lte": float(preco_max)}
    if anfitriao_id_query:
        filtro["anfitriao_id"] = parse_object_id(anfitriao_id_query, "anfitriao_id")

    # [MUDANÇA 1] Implementação de Paginação nos parâmetros da URL
    pagina = int(request.args.get("pagina", 1))
    limite = int(request.args.get("limite", 20))
    pulos = (pagina - 1) * limite

    locais_encontrados = list(
        database.locais.find(filtro)
        .sort("data_cadastro", -1)
        .skip(pulos) # Pula os registros das páginas anteriores
        .limit(limite) # Traz apenas a quantidade limite
    )

    anfitriao_ids = {local["anfitriao_id"] for local in locais_encontrados}
    anfitrioes = {
        usuario["_id"]: usuario
        for usuario in database.usuarios.find({"_id": {"$in": list(anfitriao_ids)}})
    }
    return jsonify([serialize_local(local, anfitrioes) for local in locais_encontrados])


@app.route("/api/reservas", methods=["GET", "POST"])
def reservas():
    database = get_database()

    if request.method == "POST":
        dados = request.get_json(silent=True) or {}
        local_id = parse_object_id(dados.get("local_id"), "local_id")
        
        # [MUDANÇA 2] Validando autoria pelo usuário autenticado
        hospede_id = obter_usuario_autenticado()
        
        checkin = para_data(dados.get("checkin", ""))
        checkout = para_data(dados.get("checkout", ""))

        if checkout <= checkin:
            raise ValueError("Checkout deve ser posterior ao checkin.")

        local = database.locais.find_one({"_id": local_id})
        if not local:
            raise ValueError("Imovel nao encontrado.")

        hospede = database.usuarios.find_one({"_id": hospede_id})
        if not hospede or hospede["tipo"] not in {"hospede", "ambos"}:
            raise ValueError("Somente hospedes podem fazer reservas.")

        noites = (checkout - checkin).days
        nova_reserva = {
            "local_id": local_id,
            "hospede_id": hospede_id,
            "datas": {"checkin": checkin, "checkout": checkout},
            "valor_total": float(local["preco_por_noite"]) * noites,
            "status": "confirmada",
            # [MUDANÇA 5] Data em UTC
            "data_reserva": datetime.now(timezone.utc),
        }

        # [MUDANÇA 4] Race Condition Pattern
        # Em produção com Replica Set, englobamos o select e o insert em uma Transaction.
        # Caso o servidor local não suporte transação, fazemos o fallback automático.
        conflito_query = {
            "local_id": local_id,
            "status": "confirmada",
            "datas.checkin": {"$lt": checkout},
            "datas.checkout": {"$gt": checkin},
        }

        try:
            # Tenta usar a sessão transacional (Padrão Ouro para evitar Race Condition)
            with client.start_session() as session:
                with session.start_transaction():
                    conflito = database.reservas.find_one(conflito_query, session=session)
                    if conflito:
                        return jsonify({"erro": "Este local ja esta reservado para estas datas."}), 409
                    resultado = database.reservas.insert_one(nova_reserva, session=session)
        except OperationFailure:
            # Fallback para ambiente de desenvolvimento local (Standalone sem Replica Set)
            conflito = database.reservas.find_one(conflito_query)
            if conflito:
                return jsonify({"erro": "Este local ja esta reservado para estas datas."}), 409
            resultado = database.reservas.insert_one(nova_reserva)

        nova_reserva["_id"] = resultado.inserted_id
        return jsonify(
            {
                "mensagem": "Reserva confirmada!",
                "reserva": serialize_reserva(nova_reserva, local),
            }
        ), 201

    hospede_id_query = request.args.get("hospede_id", "").strip()
    anfitriao_id_query = request.args.get("anfitriao_id", "").strip()
    status = request.args.get("status", "").strip()

    filtro = {}
    if hospede_id_query:
        filtro["hospede_id"] = parse_object_id(hospede_id_query, "hospede_id")
    if status:
        filtro["status"] = status

    if anfitriao_id_query:
        anfitriao_oid = parse_object_id(anfitriao_id_query, "anfitriao_id")
        locais_do_anfitriao = list(database.locais.find({"anfitriao_id": anfitriao_oid}, {"_id": 1}))
        local_ids = [item["_id"] for item in locais_do_anfitriao]
        if not local_ids:
            return jsonify([])
        filtro["local_id"] = {"$in": local_ids}

    # [MUDANÇA 1] Paginação para as reservas
    pagina = int(request.args.get("pagina", 1))
    limite = int(request.args.get("limite", 20))
    pulos = (pagina - 1) * limite

    reservas_encontradas = list(
        database.reservas.find(filtro)
        .sort("data_reserva", -1)
        .skip(pulos)
        .limit(limite)
    )

    local_ids = {reserva["local_id"] for reserva in reservas_encontradas}
    locais = {
        local["_id"]: local for local in database.locais.find({"_id": {"$in": list(local_ids)}})
    }
    return jsonify([serialize_reserva(reserva, locais.get(reserva["local_id"])) for reserva in reservas_encontradas])


@app.route("/api/locais/<id>/ocupacao", methods=["GET"])
def consultar_ocupacao(id):
    database = get_database()
    local_id = parse_object_id(id, "id")

    reservas_encontradas = list(
        database.reservas.find(
            {"local_id": local_id, "status": "confirmada"},
            {"datas": 1, "_id": 0},
        )
    )

    datas_bloqueadas = []
    for reserva in reservas_encontradas:
        datas_bloqueadas.append(
            {
                "desde": reserva["datas"]["checkin"].strftime("%Y-%m-%d"),
                "ate": reserva["datas"]["checkout"].strftime("%Y-%m-%d"),
            }
        )

    return jsonify(datas_bloqueadas)


if __name__ == "__main__":
    app.run(debug=True)
