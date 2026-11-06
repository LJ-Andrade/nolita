@echo off
rem Windows launcher for ./backup-production: runs it with Git Bash, so
rem ".\backup-production" works from PowerShell and cmd.
setlocal

set "GIT_BASH="
for %%B in ("%ProgramFiles%\Git\bin\bash.exe" "%ProgramFiles(x86)%\Git\bin\bash.exe" "%LOCALAPPDATA%\Programs\Git\bin\bash.exe") do (
  if not defined GIT_BASH if exist %%B set "GIT_BASH=%%~B"
)

rem Fallback: derive bash.exe from git.exe on PATH (...\Git\cmd\git.exe).
if not defined GIT_BASH (
  for /f "delims=" %%G in ('where git 2^>nul') do (
    if not defined GIT_BASH if exist "%%~dpG..\bin\bash.exe" set "GIT_BASH=%%~dpG..\bin\bash.exe"
  )
)

if not defined GIT_BASH (
  echo Git Bash not found. Install Git for Windows: https://git-scm.com/download/win
  exit /b 1
)

"%GIT_BASH%" "%~dp0backup-production" %*
exit /b %ERRORLEVEL%
