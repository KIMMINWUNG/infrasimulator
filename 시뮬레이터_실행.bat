@echo off
chcp 65001 > nul
title 지자체 합동평가 시뮬레이터
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        지자체 합동평가 시뮬레이터 (오프라인 버전)         ║
echo ║                                                            ║
echo ║        국토안전관리원 기반시설관리실                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo [1/2] Node.js 확인 중...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js가 설치되어 있지 않습니다!
    echo.
    echo 📥 Node.js 설치가 필요합니다:
    echo    1. USB 드라이브의 'node-installer.msi' 파일 실행
    echo    2. 설치 후 컴퓨터 재시작
    echo    3. 다시 이 파일을 실행하세요
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 설치 확인됨!
echo.
echo [2/2] 시뮬레이터 실행 중...
echo.

node server.cjs

if %errorlevel% neq 0 (
    echo.
    echo ❌ 서버 실행 중 오류가 발생했습니다.
    echo.
    pause
    exit /b 1
)

