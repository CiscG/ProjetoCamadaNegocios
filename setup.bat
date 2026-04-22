@echo off
echo ============================================
echo  ProjetoCamadaNegocios - Setup Windows
echo ============================================
echo.

REM Detecta o ambiente virtual existente (.venv ou venv)
set VENV_DIR=
if exist .venv\Scripts\activate.bat set VENV_DIR=.venv
if "%VENV_DIR%"=="" if exist venv\Scripts\activate.bat set VENV_DIR=venv

if not "%VENV_DIR%"=="" (
    echo [OK] Ambiente virtual encontrado em: %VENV_DIR%
    call %VENV_DIR%\Scripts\activate.bat
    echo [INFO] Instalando/atualizando dependencias...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
    echo [OK] Dependencias OK!
    goto DONE
)

REM Nenhuma venv encontrada, detecta Python
set PYTHON_CMD=
where py >nul 2>&1 && set PYTHON_CMD=py
if "%PYTHON_CMD%"=="" where python >nul 2>&1 && set PYTHON_CMD=python
if "%PYTHON_CMD%"=="" where python3 >nul 2>&1 && set PYTHON_CMD=python3

if "%PYTHON_CMD%"=="" (
    echo [ERRO] Python nao encontrado no PATH.
    echo.
    echo Solucao:
    echo  1. Baixe o Python em https://www.python.org/downloads/
    echo  2. Durante a instalacao, marque "Add Python to PATH"
    echo  3. Execute este script novamente.
    pause
    exit /b 1
)

echo [OK] Python encontrado: %PYTHON_CMD%
%PYTHON_CMD% --version
echo.
echo [INFO] Criando ambiente virtual em .venv...
%PYTHON_CMD% -m venv .venv
if errorlevel 1 (
    echo [ERRO] Falha ao criar venv.
    pause
    exit /b 1
)
call .venv\Scripts\activate.bat
echo [INFO] Instalando dependencias...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)

:DONE
echo.
echo ============================================
echo  Setup concluido!
echo.
echo  Para iniciar o servidor:
echo    start.bat
echo.
echo  Ou manualmente:
echo    .venv\Scripts\activate
echo    python app.py
echo ============================================
echo.
pause
