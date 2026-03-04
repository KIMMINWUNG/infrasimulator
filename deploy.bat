@echo off
cd /d "%~dp0"

echo Adding files...
git add .

echo Committing...
git commit -m "Update: plan year 25/26, metric toggles, duration display, admin same logic, rank column, fix DataCloneError"

echo Pushing to GitHub...
git push origin main

echo Done.
pause
