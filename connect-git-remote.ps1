# KIMMINWUNG/infrasimulator 원격 저장소 연결
# Git 설치 후 PowerShell에서: .\connect-git-remote.ps1

$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/KIMMINWUNG/infrasimulator.git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git이 설치되어 있지 않거나 PATH에 없습니다. https://git-scm.com/download/win 에서 설치 후 다시 실행하세요." -ForegroundColor Yellow
    exit 1
}

Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
    git init
    Write-Host "Git 저장소를 초기화했습니다." -ForegroundColor Green
}

if (git remote get-url origin 2>$null) {
    git remote set-url origin $repoUrl
    Write-Host "origin 원격 주소를 다음으로 설정했습니다: $repoUrl" -ForegroundColor Green
} else {
    git remote add origin $repoUrl
    Write-Host "origin 원격을 추가했습니다: $repoUrl" -ForegroundColor Green
}

git branch -M main 2>$null
Write-Host "`n다음으로 커밋 후 푸시하세요:" -ForegroundColor Cyan
Write-Host "  git add ."
Write-Host "  git commit -m `"프로젝트 정리 및 원격 연결`""
Write-Host "  git push -u origin main"
Write-Host "`n(기존 원격 이력을 덮어쓰려면: git push -u origin main --force)" -ForegroundColor Gray
