@echo off
echo ============================================
echo  ProjetoCamadaNegocios - Iniciar Servidor
echo ============================================
echo.

echo [INFO] Verificando Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Java nao encontrado. Instale Java 17+: https://adoptium.net/
    pause
    exit /b 1
)

echo [INFO] Verificando Maven...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Maven nao encontrado. Instale Maven 3.6+: https://maven.apache.org/
    pause
    exit /b 1
)

echo.
echo [INFO] Iniciando aplicacao em http://localhost:5000 ...
echo [INFO] Pressione Ctrl+C para parar.
echo.

mvnw.cmd spring-boot:run
pause
