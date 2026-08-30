@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js a npm nejsou nainstalovane nebo nejsou dostupne v PATH.
  echo Nainstalujte prosim Node.js LTS z https://nodejs.org/ a spuste tento soubor znovu.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Prvni spusteni - instaluji zavislosti...
  call npm ci
  if errorlevel 1 (
    echo.
    echo Instalace zavislosti selhala.
    pause
    exit /b 1
  )
)

echo Spoustim Modal Logic Lab...
echo Aplikace se otevře v prohlizeci. Pro ukonceni zavrete toto okno nebo stisknete Ctrl+C.
call npm run dev -- --open
