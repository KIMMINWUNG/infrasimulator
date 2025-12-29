@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 현재 디렉토리:
cd

echo.
echo 기존 .git 삭제 중...
if exist .git rmdir /s /q .git

echo.
echo Git 초기화 중...
git init

echo.
echo 파일 추가 중...
git add .

echo.
echo 커밋 중...
git commit -m "Initial commit: 지자체 합동평가 시뮬레이터"

echo.
echo 브랜치를 main으로 변경 중...
git branch -M main

echo.
echo 기존 remote 제거 중...
git remote remove origin 2>nul

echo.
echo Remote 추가 중...
git remote add origin https://github.com/KIMMINWUNG/infrasimulator.git

echo.
echo Remote 확인:
git remote -v

echo.
echo 푸시 중...
git push -u origin main --force

echo.
echo 완료!
