# ProjetoCamadaNegocios

Plataforma de aluguel de imóveis por temporada — clone didático do Airbnb — desenvolvida com **Flask**, **MongoDB** e **React + Vite**.

---

## Tecnologias

- **Backend:** Python 3.10+ · Flask 3.x · MongoDB
- **Frontend:** React 19 · Vite · Tailwind CSS · React Router

---

## Pré-requisitos

- [Python 3.10+](https://www.python.org/downloads/) — marque **"Add Python to PATH"**
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Community](https://www.mongodb.com/try/download/community) — ou use o WSL (veja abaixo)

---

## Como rodar (desenvolvimento)

Você precisará de **dois terminais abertos** ao mesmo tempo.

### Terminal 1 — Backend Flask

```powershell
# Na raiz do projeto
pip install -r requirements.txt
python app.py
```

Roda em **http://localhost:5000**

### Terminal 2 — Frontend React

```powershell
cd FrontEnd
npm install
npm run dev
```

Acesse **http://localhost:5173** no navegador.

> O Vite redireciona automaticamente as chamadas `/api` para o Flask na porta 5000.

---

## Como rodar (produção)

Gere o build do frontend e sirva tudo pelo Flask:

```powershell
cd FrontEnd
npm run build
cd ..
python app.py
```

Acesse **http://localhost:5000** no navegador.

---

## MongoDB no WSL (Linux)

Se preferir rodar o MongoDB via WSL em vez de instalar no Windows:

```bash
sudo service mongod start
```

---

## Dados de demonstração

O banco é populado automaticamente na primeira requisição.

| Email | Perfil | Senha |
|---|---|---|
| carlos@email.com | anfitriao | 123456 |
| maria@email.com | hospede | 123456 |
| ana@email.com | ambos | 123456 |

> Para reinserir os dados do zero: `python routes.py`

---

## Funcionalidades

| Recurso | Detalhes |
|---|---|
| Login | Autenticação por email/senha com hash bcrypt |
| Busca de imóveis | Filtro por cidade e preço máximo |
| Reserva | Criação com verificação de conflito de datas |
| Disponibilidade | Visualização de períodos ocupados |
| Dashboard | Reservas como hóspede e imóveis como anfitrião |
| Anúncio | Cadastro de novo imóvel (perfis `anfitriao` e `ambos`) |

---

## API REST

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/login` | Autenticar usuário |
| `GET` | `/api/locais` | Listar imóveis (`cidade`, `preco_max`, `anfitriao_id`) |
| `POST` | `/api/locais` | Cadastrar imóvel |
| `GET` | `/api/locais/<id>/ocupacao` | Períodos ocupados |
| `GET` | `/api/reservas` | Listar reservas (`hospede_id`, `anfitriao_id`, `status`) |
| `POST` | `/api/reservas` | Criar reserva |
