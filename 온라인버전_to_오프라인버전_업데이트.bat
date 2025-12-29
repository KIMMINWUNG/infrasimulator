@echo off
chcp 65001 > nul
title 온라인 버전 → 오프라인 버전 업데이트
cls

echo.
echo ═══════════════════════════════════════════════════════════
echo   온라인 버전에서 오프라인 버전으로 업데이트
echo ═══════════════════════════════════════════════════════════
echo.

:INPUT_PATH
set /p ONLINE_PATH="온라인 버전 프로젝트 경로를 입력하세요: "

if not exist "%ONLINE_PATH%" (
    echo.
    echo ❌ 경로를 찾을 수 없습니다!
    echo.
    goto INPUT_PATH
)

echo.
echo ═══════════════════════════════════════════════════════════
echo   업데이트 시작
echo ═══════════════════════════════════════════════════════════
echo.

echo [1/5] src 폴더 복사 중...
xcopy /E /Y /I "%ONLINE_PATH%\src" "src"

echo [2/5] 필요한 public 파일 복사 중...
if exist "%ONLINE_PATH%\public\ci_logo.png" copy /Y "%ONLINE_PATH%\public\ci_logo.png" "public\"
if exist "%ONLINE_PATH%\public\management_list.xlsx" copy /Y "%ONLINE_PATH%\public\management_list.xlsx" "public\"
if exist "%ONLINE_PATH%\public\vite.svg" copy /Y "%ONLINE_PATH%\public\vite.svg" "public\"

echo [3/5] calculation.worker.js 백업 중...
copy /Y "public\calculation.worker.js" "public\calculation.worker.js.backup"

echo.
echo ⚠️  주의: public\calculation.worker.js 파일을 수동으로 확인하세요!
echo    CDN 사용 여부를 체크해야 합니다.
echo.

echo [4/5] index.html 복사 중... (백업 생성)
if exist "index.html" copy /Y "index.html" "index.html.backup"
copy /Y "%ONLINE_PATH%\index.html" "index.html"

echo [5/5] package.json 확인...
echo.
echo ✅ 파일 복사 완료!
echo.
echo ═══════════════════════════════════════════════════════════
echo   다음 단계를 진행하세요:
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. public\calculation.worker.js 파일 열기
echo    - CDN 사용하는 줄 찾기:
echo      self.importScripts('https://cdn.jsdelivr.net/...')
echo    - 로컬 경로로 변경:
echo      self.importScripts('/xlsx.full.min.js')
echo.
echo 2. index.html 파일 확인
echo    - CDN 링크 ("<link href='https://...'") 제거
echo.
echo 3. CDN 검색
echo    - 프로젝트에서 "cdn" 또는 "https://" 검색
echo.
echo 4. 빌드 및 테스트
echo    - npm run package
echo    - 테스트_실행.bat
echo.
echo ═══════════════════════════════════════════════════════════
echo.

pause

