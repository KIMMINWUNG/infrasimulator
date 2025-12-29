# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 현재 스크립트 위치로 이동
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "현재 디렉토리: $(Get-Location)" -ForegroundColor Green

# 기존 .git 삭제
if (Test-Path .git) {
    Write-Host "기존 .git 삭제 중..." -ForegroundColor Yellow
    Remove-Item -Path .git -Recurse -Force
}

# Git 초기화
Write-Host "Git 초기화 중..." -ForegroundColor Yellow
git init

# 파일 추가
Write-Host "파일 추가 중..." -ForegroundColor Yellow
git add .

# 커밋
Write-Host "커밋 중..." -ForegroundColor Yellow
git commit -m "Initial commit: 지자체 합동평가 시뮬레이터"

# 브랜치를 main으로 변경
Write-Host "브랜치를 main으로 변경 중..." -ForegroundColor Yellow
git branch -M main

# 기존 remote 제거
Write-Host "기존 remote 제거 중..." -ForegroundColor Yellow
git remote remove origin 2>$null

# Remote 추가
Write-Host "Remote 추가 중..." -ForegroundColor Yellow
git remote add origin https://github.com/KIMMINWUNG/infrasimulator.git

# Remote 확인
Write-Host "Remote 확인:" -ForegroundColor Yellow
git remote -v

# 푸시
Write-Host "푸시 중..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host "완료!" -ForegroundColor Green

