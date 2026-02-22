@echo off
setlocal

cd /d "%~dp0"
set "PORT=5500"
set "NODE_DIR=%ProgramFiles%\nodejs"
set "PATH=%NODE_DIR%;%PATH%"
set "NPX=%ProgramFiles%\nodejs\npx.cmd"

if exist "%NPX%" (
  echo Iniciando servidor local en http://localhost:%PORT%/
  start "" "http://localhost:%PORT%/"
  call "%NPX%" --yes serve . -l %PORT%
  if %errorlevel%==0 goto :eof
  echo.
  echo npx fallo. Intentando con servidor Python...
)

where npx >nul 2>&1
if %errorlevel%==0 (
  echo Iniciando servidor local en http://localhost:%PORT%/
  start "" "http://localhost:%PORT%/"
  call npx --yes serve . -l %PORT%
  if %errorlevel%==0 goto :eof
  echo.
  echo npx fallo. Intentando con servidor Python...
)

where py >nul 2>&1
if %errorlevel%==0 (
  echo Iniciando servidor local en http://localhost:%PORT%/ con Python
  start "" "http://localhost:%PORT%/"
  py -m http.server %PORT%
  goto :eof
)

echo No se pudo iniciar servidor local.
echo Instala Node.js o Python y vuelve a intentar.
echo Node.js: https://nodejs.org/
echo Python: https://www.python.org/downloads/
pause
exit /b 1
