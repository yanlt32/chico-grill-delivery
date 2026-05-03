# Script para baixar imagens - Execute da raiz do projeto
# PowerShell: .\download-imagens.ps1

$urls = @{
    # Espetos
    'frontend/images/espetos/carne.png' = 'https://images.unsplash.com/photo-1555939594-58d7cb561405?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/misto.png' = 'https://images.unsplash.com/photo-1584737612207-191eca84f1a7?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/kafta.png' = 'https://images.unsplash.com/photo-1605850730589-b61b97ad8ffe?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/coracao.png' = 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/tulipa.png' = 'https://images.unsplash.com/photo-1555939594-58d7cb561405?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/panceta.png' = 'https://images.unsplash.com/photo-1587270501670-d57ebfe80fe0?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/paoalho.png' = 'https://images.unsplash.com/photo-1585521922217-efd7327a801d?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/frango.png' = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/queijo.png' = 'https://images.unsplash.com/photo-1585521922217-efd7327a801d?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/toscana.png' = 'https://images.unsplash.com/photo-1587270501670-d57ebfe80fe0?auto=format&fit=crop&w=400&q=60'
    'frontend/images/espetos/apimentada.png' = 'https://images.unsplash.com/photo-1587270501670-d57ebfe80fe0?auto=format&fit=crop&w=400&q=60'
    
    # Burgers
    'frontend/images/burgers/burger_najla.png' = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60'
    'frontend/images/burgers/burger_jojo.png' = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60'
    'frontend/images/burgers/burger_toguro.png' = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60'
    'frontend/images/burgers/burger_bony.png' = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60'
    'frontend/images/burgers/burger_picanha.png' = 'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=400&q=60'
    'frontend/images/burgers/burger_espeto.png' = 'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=400&q=60'
    'frontend/images/burgers/burger_espeto_duplo.png' = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60'
    
    # Bebidas
    'frontend/images/bebidas/heineken.png' = 'https://images.unsplash.com/photo-1608270861620-7c38b178ce95?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/stella.png' = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/budweiser.png' = 'https://images.unsplash.com/photo-1608270861388-c96cd28d4e56?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/eisenbahn.png' = 'https://images.unsplash.com/photo-1608270861620-7c38b178ce95?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/brahma.png' = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/skol.png' = 'https://images.unsplash.com/photo-1608270861388-c96cd28d4e56?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/amstel.png' = 'https://images.unsplash.com/photo-1608270861620-7c38b178ce95?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/refri.png' = 'https://images.unsplash.com/photo-1608270861620-7c38b178ce95?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/suco.png' = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=400&q=60'
    'frontend/images/bebidas/agua.png' = 'https://images.unsplash.com/photo-1608270861388-c96cd28d4e56?auto=format&fit=crop&w=400&q=60'
}

Write-Host "🚀 Iniciando download de imagens..." -ForegroundColor Green

$count = 0
foreach ($file in $urls.Keys) {
    $dir = Split-Path $file
    
    # Criar diretório se não existir
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Diretório criado: $dir" -ForegroundColor Yellow
    }
    
    # Baixar imagem
    try {
        $url = $urls[$file]
        Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing
        Write-Host "✅ $file" -ForegroundColor Green
        $count++
    } catch {
        Write-Host "❌ Erro ao baixar $file : $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Download concluído! $count imagens baixadas." -ForegroundColor Green
