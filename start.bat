@echo off
echo ============================================
echo  ProjetoCamadaNegocios - Iniciar Servidor
echo ============================================
echo.

REM Detecta o ambiente virtual existente (.venv ou venv)
set VENV_DIR=
if exist .venv\Scripts\activate.bat set VENV_DIR=.venv
if "%VENV_DIR%"=="" if exist venv\Scripts\activate.bat set VENV_DIR=venv

if not "%VENV_DIR%"=="" (
    echo [INFO] Ativando ambiente virtual: %VENV_DIR%
    call %VENV_DIR%\Scripts\activate.bat
) else (
    echo [AVISO] Nenhum ambiente virtual encontrado. Execute setup.bat primeiro.
    echo         Tentando usar Python do sistema...
)

echo.
echo [INFO] Verificando dependencias...
python -c "import flask, pymongo, werkzeug" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Dependencias nao instaladas. Execute setup.bat primeiro.
    pause
    exit /b 1
)
echo [OK] Dependencias OK.

echo.
echo [INFO] Verificando MongoDB...
python -c "
from pymongo import MongoClient
import os
uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
try:
    MongoClient(uri, serverSelectionTimeoutMS=2000).admin.command('ping')
    print('[OK] MongoDB conectado em ' + uri)
except Exception as e:
    print('[AVISO] MongoDB nao disponivel: ' + str(e)[:80])
    print('[AVISO] O servidor vai iniciar, mas as APIs retornarao erro 503.')
    print('[INFO]  Instale o MongoDB: https://www.mongodb.com/try/download/community')
"

echo.
echo [INFO] Iniciando Flask em http://localhost:5000 ...
echo [INFO] Pressione Ctrl+C para parar.
echo.

python app.py
pause
