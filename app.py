from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)

# Conexão com o seu banco airbnb_clone
client = MongoClient("mongodb://localhost:27017/")
db = client["airbnb_clone"]

# --- HELPER: Conversão de string para datetime ---
def para_data(data_str):
    return datetime.strptime(data_str, "%Y-%m-%d")

# 1. POST: Cadastro de Local
@app.route('/api/locais', methods=['POST'])
def cadastrar_local():
    dados = request.json
    
    novo_local = {
        "anfitriao_id": ObjectId(dados['anfitriao_id']),
        "titulo": dados['titulo'],
        "descricao": dados['descricao'],
        "preco_por_noite": float(dados['preco_por_noite']),
        "endereco": dados['endereco'], # Espera {cidade, estado, pais}
        "comodidades": dados.get('comodidades', []),
        "data_cadastro": datetime.now()
    }
    
    resultado = db.locais.insert_one(novo_local)
    return jsonify({"id": str(resultado.inserted_id), "status": "sucesso"}), 201

# 2. POST: Adição de Reserva (Com Verificação de Choque de Datas)
@app.route('/api/reservas', methods=['POST'])
def criar_reserva():
    dados = request.json
    local_id = ObjectId(dados['local_id'])
    checkin = para_data(dados['checkin'])
    checkout = para_data(dados['checkout'])

    # REGRA DE OURO: Verificar se já existe reserva que sobrepõe este período
    # Lógica: (NovoCheckin < ReservaExistenteCheckout) E (NovoCheckout > ReservaExistenteCheckin)
    conflito = db.reservas.find_one({
        "local_id": local_id,
        "status": "confirmada",
        "datas.checkin": {"$lt": checkout},
        "datas.checkout": {"$gt": checkin}
    })

    if conflito:
        return jsonify({"erro": "Este local já está reservado para estas datas."}), 409

    # Se não houver conflito, calculamos o valor e salvamos
    local = db.locais.find_one({"_id": local_id})
    noites = (checkout - checkin).days
    
    nova_reserva = {
        "local_id": local_id,
        "hospede_id": ObjectId(dados['hospede_id']),
        "datas": {"checkin": checkin, "checkout": checkout},
        "valor_total": local['preco_por_noite'] * noites,
        "status": "confirmada",
        "data_reserva": datetime.now()
    }
    
    db.reservas.insert_one(nova_reserva)
    return jsonify({"status": "Reserva confirmada!"}), 201

# 3. GET: Consulta de Locais (Com filtros)
@app.route('/api/locais', methods=['GET'])
def buscar_locais():
    cidade = request.args.get('cidade')
    preco_max = request.args.get('preco_max')
    
    filtro = {}
    if cidade: filtro["endereco.cidade"] = cidade
    if preco_max: filtro["preco_por_noite"] = {"$lte": float(preco_max)}

    locais = list(db.locais.find(filtro))
    
    # Limpeza para JSON
    for l in locais:
        l['_id'] = str(l['_id'])
        l['anfitriao_id'] = str(l['anfitriao_id'])
        
    return jsonify(locais)

# 4. GET: Consulta de Dias Ocupados (Para o calendário da página)
@app.route('/api/locais/<id>/ocupacao', methods=['GET'])
def consultar_ocupacao(id):
    # Busca todas as reservas confirmadas para aquele local
    reservas = list(db.reservas.find(
        {"local_id": ObjectId(id), "status": "confirmada"},
        {"datas": 1, "_id": 0}
    ))
    
    # Formata as datas para o front-end saber o que bloquear no calendário
    datas_bloqueadas = []
    for r in reservas:
        datas_bloqueadas.append({
            "desde": r['datas']['checkin'].strftime("%Y-%m-%d"),
            "ate": r['datas']['checkout'].strftime("%Y-%m-%d")
        })
        
    return jsonify(datas_bloqueadas)

if __name__ == '__main__':
    app.run(debug=True)