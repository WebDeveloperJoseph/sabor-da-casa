# Script para regenerar Prisma Client quando o arquivo DLL está bloqueado
# Uso: .\scripts\regenerate-prisma.ps1

Write-Host "Parando processos Node.js que podem estar bloqueando o Prisma Client..." -ForegroundColor Yellow

# Parar processos node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Aguardar um momento
Start-Sleep -Seconds 1

Write-Host "Processos parados" -ForegroundColor Green
Write-Host ""
Write-Host "Regenerando Prisma Client..." -ForegroundColor Cyan

# Executar prisma generate
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Prisma Client regenerado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora reinicie o dev server:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Erro ao regenerar Prisma Client" -ForegroundColor Red
    Write-Host "Feche todos os terminais e a IDE, depois execute novamente." -ForegroundColor Yellow
}
