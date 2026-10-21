$projectPath = "C:\Users\Tenmozhi Kuppusamy\Downloads\prior-auth-system"

Set-Location $projectPath

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectPath'; npm run dev -- --host 0.0.0.0"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectPath'; node server.js"

Write-Host "Frontend and backend started."
Write-Host "Open: http://localhost:5174/prior-auth-system/"
