import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from faker import Faker
from werkzeug.security import generate_password_hash

# Conexão com o banco local
client = MongoClient("mongodb://localhost:27017/")
db = client["airbnb_clone"]

# Utilizando o Faker em português
fake = Faker('pt_BR')

def limpar_banco():
    print("Limpando coleções antigas...")
    db.usuarios.delete_many({})
    db.locais.delete_many({})
    db.reservas.delete_many({})

def gerar_usuarios(quantidade=10):
    print(f"Gerando {quantidade} usuários...")
    usuarios = []
    tipos = ["anfitriao", "hospede", "ambos"]
    
    for _ in range(quantidade):
        usuario = {
            "nome": fake.name(),
            "email": fake.unique.email(),
            "senha_hash": generate_password_hash("senha123"), # Senha padrão para testes
            "tipo": random.choice(tipos)
        }
        usuarios.append(usuario)
    
    resultado = db.usuarios.insert_many(usuarios)
    return resultado.inserted_ids

def gerar_locais(anfitriao_ids, quantidade=15):
    print(f"Gerando {quantidade} locais...")
    locais = []
    lista_comodidades = ["Wi-Fi", "Ar Condicionado", "Piscina", "Cozinha equipada", "Garagem", "TV a cabo", "Churrasqueira"]
    
    for _ in range(quantidade):
        local = {
            "anfitriao_id": random.choice(anfitriao_ids),
            "titulo": f"{random.choice(['Lindo', 'Aconchegante', 'Espaçoso', 'Moderno'])} {random.choice(['Apartamento', 'Flat', 'Casa', 'Studio', 'Chalé'])}",
            "descricao": fake.text(max_nb_chars=200),
            "preco_por_noite": round(random.uniform(100.0, 800.0), 2),
            "endereco": {
                "cidade": fake.city(),
                "estado": fake.estado_sigla(),
                "pais": "Brasil"
            },
            "comodidades": random.sample(lista_comodidades, k=random.randint(2, 6)),
            "data_cadastro": datetime.now() - timedelta(days=random.randint(1, 365))
        }
        locais.append(local)
        
    resultado = db.locais.insert_many(locais)
    return resultado.inserted_ids

def gerar_reservas(hospede_ids, local_ids, quantidade=20):
    print(f"Gerando {quantidade} reservas...")
    reservas = []
    
    for _ in range(quantidade):
        local_id = random.choice(local_ids)
        hospede_id = random.choice(hospede_ids)
        
        # Simulando datas
        hoje = datetime.now()
        dias_para_frente = random.randint(1, 60)
        checkin = hoje + timedelta(days=dias_para_frente)
        noites = random.randint(1, 15)
        checkout = checkin + timedelta(days=noites)
        
        # Buscando o preço do local para calcular o total
        local = db.locais.find_one({"_id": local_id})
        valor_total = float(local["preco_por_noite"]) * noites
        
        reserva = {
            "local_id": local_id,
            "hospede_id": hospede_id,
            "datas": {
                "checkin": checkin,
                "checkout": checkout
            },
            "valor_total": valor_total,
            "status": random.choice(["confirmada", "pendente", "cancelada"]),
            "data_reserva": hoje - timedelta(days=random.randint(1, 30))
        }
        reservas.append(reserva)
        
    db.reservas.insert_many(reservas)

if __name__ == "__main__":
    limpar_banco()
    
    # 1. Cria usuários e separa os IDs por tipo
    todos_usuarios_ids = gerar_usuarios(15)
    usuarios_cadastrados = list(db.usuarios.find({"_id": {"$in": todos_usuarios_ids}}))
    
    anfitrioes = [u["_id"] for u in usuarios_cadastrados if u["tipo"] in {"anfitriao", "ambos"}]
    hospedes = [u["_id"] for u in usuarios_cadastrados if u["tipo"] in {"hospede", "ambos"}]
    
    # 2. Cria os locais vinculados aos anfitriões
    locais_ids = gerar_locais(anfitrioes, 25)
    
    # 3. Cria as reservas vinculando hóspedes e locais
    gerar_reservas(hospedes, locais_ids, 40)
    
    print("\nMock de dados gerado com sucesso!")
    print(f"Total na base: {db.usuarios.count_documents({})} Usuários, {db.locais.count_documents({})} Locais, {db.reservas.count_documents({})} Reservas.")
