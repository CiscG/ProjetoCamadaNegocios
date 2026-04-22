import os

from pymongo import MongoClient

from seed_data import DEMO_PASSWORD, DEMO_USERS, reset_seed_data

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client["airbnb_clone"]

reset_seed_data(db)

print("Mock de dados inserido com sucesso!")
print("Usuarios de demonstracao:")
for usuario in DEMO_USERS:
    print(f"- {usuario['email']} ({usuario['tipo']}) | senha: {DEMO_PASSWORD}")
