@echo off
REM ZeddiGames Launcher - Spuštění vývojového serveru
REM Nastav MSVC prostředí a spusť Tauri dev

set MSVC_VER=14.44.35207
set MSVC_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\%MSVC_VER%\bin\Hostx86\x64
set SDK_VER=10.0.22000.0
set SDK_LIB=C:\Program Files (x86)\Windows Kits\10\Lib\%SDK_VER%
set MSVC_LIB=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\%MSVC_VER%\lib\x64

set PATH=%MSVC_PATH%;%PATH%
set LIB=%MSVC_LIB%;%SDK_LIB%\um\x64;%SDK_LIB%\ucrt\x64

echo Spoustim ZeddiGames Launcher dev server...
npm run tauri dev
