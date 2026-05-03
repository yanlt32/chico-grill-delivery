const canvas = require('canvas');
const fs = require('fs');
const path = require('path');

// Cores para cada categoria
const CORES = {
    espetos: '#D2691E',      // Marrom
    burgers: '#8B4513',      // Marrom escuro
    bebidas: '#FFD700'       // Dourado
};

const PRODUTOS = {
    espetos: [
        { nome: 'Carne', id: 'carne' },
        { nome: 'Misto', id: 'misto' },
        { nome: 'Kafta', id: 'kafta' },
        { nome: 'Coração', id: 'coracao' },
        { nome: 'Tulipa', id: 'tulipa' },
        { nome: 'Panceta', id: 'panceta' },
        { nome: 'Pão de Alho', id: 'paoalho' },
        { nome: 'Frango', id: 'frango' },
        { nome: 'Queijo', id: 'queijo' },
        { nome: 'Toscana', id: 'toscana' },
        { nome: 'Apimentada', id: 'apimentada' }
    ],
    burgers: [
        { nome: 'Big Najla', id: 'burger_najla' },
        { nome: 'Big Jojo', id: 'burger_jojo' },
        { nome: 'Big Toguro', id: 'burger_toguro' },
        { nome: 'Big Bony', id: 'burger_bony' },
        { nome: 'Big Picanha', id: 'burger_picanha' },
        { nome: 'Espeto', id: 'burger_espeto' },
        { nome: 'Espeto Duplo', id: 'burger_espeto_duplo' }
    ],
    bebidas: [
        { nome: 'Heineken', id: 'heineken' },
        { nome: 'Stella', id: 'stella' },
        { nome: 'Budweiser', id: 'budweiser' },
        { nome: 'Eisenbahn', id: 'eisenbahn' },
        { nome: 'Brahma', id: 'brahma' },
        { nome: 'Skol', id: 'skol' },
        { nome: 'Amstel', id: 'amstel' },
        { nome: 'Refri', id: 'refri' },
        { nome: 'Suco', id: 'suco' },
        { nome: 'Água', id: 'agua' }
    ]
};

const EMOJIS = {
    espetos: '🔥',
    burgers: '🍔',
    bebidas: '🍺'
};

function criarImagem(categoria, nome, nomeArquivo, cor, emoji) {
    const largura = 400;
    const altura = 400;
    
    const canv = canvas.createCanvas(largura, altura);
    const ctx = canv.getContext('2d');
    
    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, largura, altura);
    gradient.addColorStop(0, cor);
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, largura, altura);
    
    // Texto do nome
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nome, largura / 2, altura / 2 - 40);
    
    // Emoji grande
    ctx.font = '120px Arial';
    ctx.fillText(emoji, largura / 2, altura / 2 + 60);
    
    // Categoria em rodapé
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px Arial';
    ctx.fillText(categoria.toUpperCase(), largura / 2, altura - 30);
    
    return canv.toBuffer('image/png');
}

function criarDiretorio(caminho) {
    if (!fs.existsSync(caminho)) {
        fs.mkdirSync(caminho, { recursive: true });
        console.log(`✅ Diretório criado: ${caminho}`);
    }
}

async function gerarImagens() {
    console.log('🎨 Gerando imagens dos produtos...\n');
    
    let total = 0;
    
    for (const [categoria, produtos] of Object.entries(PRODUTOS)) {
        const corCategoria = CORES[categoria];
        const emoji = EMOJIS[categoria];
        const dirCategoria = path.join(__dirname, 'frontend', 'images', categoria);
        
        criarDiretorio(dirCategoria);
        
        console.log(`\n📂 ${categoria.toUpperCase()}`);
        
        for (const produto of produtos) {
            try {
                // Use o ID completo para o nome do arquivo
                const caminhoArquivo = path.join(dirCategoria, `${produto.id}.png`);
                
                const buffer = criarImagem(categoria, produto.nome, produto.id, corCategoria, emoji);
                fs.writeFileSync(caminhoArquivo, buffer);
                
                console.log(`  ✅ ${produto.id}.png`);
                total++;
            } catch (error) {
                console.log(`  ❌ Erro ao criar ${produto.id}.png: ${error.message}`);
            }
        }
    }
    
    console.log(`\n✅ Total de imagens criadas: ${total}`);
}

gerarImagens().catch(console.error);
