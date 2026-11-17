@echo off
chcp 65001 >nul
title Installation TotalEnergies Station Manager - PWA Setup
color 0C

echo ===============================================================================
echo            TOTALENERGIES STATION SERVICE - GESTION MULTI-STATIONS
echo                      INSTALLATEUR DE L'APPLICATION DESKTOP
echo ===============================================================================
echo.
echo Configuration du raccourci bureau et lancement de l'application...
echo.

set APP_URL=http://localhost:3000
set DESKTOP_PATH=%USERPROFILE%\Desktop
set SCRIPT_DIR=%~dp0

:: Recherche de Google Chrome ou Microsoft Edge
set BROWSER_PATH=
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_PATH=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
)

:: Creation du raccourci VBScript sur le bureau
echo [1/2] Creation du raccourci autonome sur le Bureau Windows...

set VBS_SCRIPT=%TEMP%\create_shortcut_%RANDOM%.vbs
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = "%DESKTOP_PATH%\TotalEnergies Station Manager.lnk" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"

if defined BROWSER_PATH (
    echo oLink.TargetPath = "%BROWSER_PATH%" >> "%VBS_SCRIPT%"
    echo oLink.Arguments = "--app=%APP_URL% --start-maximized" >> "%VBS_SCRIPT%"
) else (
    echo oLink.TargetPath = "%APP_URL%" >> "%VBS_SCRIPT%"
)

echo oLink.Description = "Application de Gestion Multi-Stations TotalEnergies" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

cscript //nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%" 2>nul

echo [2/2] Raccourci cree avec succes sur le Bureau !
echo.
echo ===============================================================================
echo   Lancement de l'application en mode autonome plein ecran (sans navigateur)...
echo ===============================================================================
echo.

if defined BROWSER_PATH (
    start "" "%BROWSER_PATH%" --app=%APP_URL%
) else (
    start "" "%APP_URL%"
)

timeout /t 3 >nul
exit
