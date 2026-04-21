# app.py
from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

# 1. Configuração e Conexão (Fica no topo do arquivo)
client = MongoClient("mongodb://localhost:27017/")
db = client["airbnb_clone"]

# 2. Rota de Leitura (GET)
@app.route('/locais', methods=['GET'])
def listar_locais():
    cidade = request.args.get('cidade')
    filtro = {"endereco.cidade": cidade} if cidade else {}

    resultado = list(db.locais.find(filtro))
    
    for item in resultado:
        item['_id'] = str(item['_id'])
        item['anfitriao_id'] = str(item['anfitriao_id'])
        
    return jsonify(resultado)

# 3. Rota de Escrita (POST)
@app.route('/reservar', methods=['POST'])
def criar_reserva():
    dados = request.json
    local = db.locais.find_one({"_id": ObjectId(dados['local_id'])})
    
    if not local:
        return jsonify({"erro": "Local não encontrado"}), 404

    nova_reserva = {
        "local_id": ObjectId(dados['local_id']),
        "hospede_id": ObjectId(dados['hospede_id']),
        "datas": {
            "checkin": dados['checkin'],
            "checkout": dados['checkout']
        },
        "valor_total": local['preco_por_noite'] * dados['noites'],
        "status": "confirmada"
    }

    db.reservas.insert_one(nova_reserva)
    return jsonify({"status": "Reserva realizada com sucesso!"}), 201

# 4. Comando para rodar o servidor (Fica no final do arquivo)
if __name__ == '__main__':
    app.run(debug=True)