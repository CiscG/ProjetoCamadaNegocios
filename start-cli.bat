@echo off
echo ============================================
echo  ProjetoCamadaNegocios - Modo Terminal CLI
echo ============================================
echo.

mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--cli"
pause
