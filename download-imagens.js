const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs de imagens genéricas para bebidas
const IMAGENS_BEBIDAS = {
    heineken: 'https://images.unsplash.com/photo-1608270861620-7c38b178ce95?auto=format&fit=crop&w=400&q=60',
    stella: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=400&q=60',
    budweiser: 'https://images.unsplash.com/photo-1608270861388-c96cd28d4e56?auto=format&fit=crop&w=400&q=60',
    eisenbahn: 'https://images.unsplash.com/photo-1608270861620-7c38b178ce95?auto=format&fit=crop&w=400&q=60',
    brahma: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=400&q=60',
    skol: 'https://images.unsplash.com/photo-1608270861388-c96cd28d4e56?auto=format&fit=crop&w=400&q=60',
    amstel: 'https://images.unsplash.com/photo-1608270861620-7c38b178ce95?auto=format&fit=crop&w=400&q=60',
};

// URLs para outros genéricos
const IMAGENS_ESPETOS = {
    carne: 'https://images.unsplash.com/photo-1555939594-58d7cb561405?auto=format&fit=crop&w=400&q=60',
    misto: 'https://images.unsplash.com/photo-1584737612207-191eca84f1a7?auto=format&fit=crop&w=400&q=60',
    kafta: 'https://images.unsplash.com/photo-1605850730589-b61b97ad8ffe?auto=format&fit=crop&w=400&q=60',
    coracao: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=400&q=60',
    tulipa: 'https://images.unsplash.com/photo-1555939594-58d7cb561405?auto=format&fit=crop&w=400&q=60',
    panceta: 'https://images.unsplash.com/photo-1587270501670-d57ebfe80fe0?auto=format&fit=crop&w=400&q=60',
    paoalho: 'https://images.unsplash.com/photo-1585521922217-efd7327a801d?auto=format&fit=crop&w=400&q=60',
    frango: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=60',
    queijo: 'https://images.unsplash.com/photo-1585521922217-efd7327a801d?auto=format&fit=crop&w=400&q=60',
    toscana: 'https://images.unsplash.com/photo-1587270501670-d57ebfe80fe0?auto=format&fit=crop&w=400&q=60',
    apimentada: 'https://images.unsplash.com/photo-1587270501670-d57ebfe80fe0?auto=format&fit=crop&w=400&q=60',
};

const IMAGENS_BURGERS = {
    burger_najla: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60',
    burger_jojo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60',
    burger_toguro: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60',
    burger_bony: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60',
    burger_picanha: 'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=400&q=60',
    burger_espeto: 'https://images.unsplash.com/photo-1553979459-d2229a743c2b?auto=format&fit=crop&w=400&q=60',
    burger_espeto_duplo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=60',
};

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => reject(err));
        });
    });
}

async function criarDiretorios() {
    const dirs = [
        'frontend/images/espetos',
        'frontend/images/burgers',
        'frontend/images/bebidas'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Diretório criado: ${dir}`);
        }
    });
}

async function baixarImagens() {
    console.log('📥 Iniciando download de imagens...\n');

    // Bebidas
    console.log('🍺 Baixando imagens de bebidas...');
    for (const [nome, url] of Object.entries(IMAGENS_BEBIDAS)) {
        const filepath = path.join('frontend/images/bebidas', `${nome}.png`);
        try {
            await downloadImage(url, filepath);
            console.log(`  ✅ ${nome}.png`);
        } catch (err) {
            console.log(`  ❌ Erro ao baixar ${nome}.png:`, err.message);
        }
    }

    // Espetos
    console.log('\n🔥 Baixando imagens de espetos...');
    for (const [nome, url] of Object.entries(IMAGENS_ESPETOS)) {
        const filepath = path.join('frontend/images/espetos', `${nome}.png`);
        try {
            await downloadImage(url, filepath);
            console.log(`  ✅ ${nome}.png`);
        } catch (err) {
            console.log(`  ❌ Erro ao baixar ${nome}.png:`, err.message);
        }
    }

    // Burgers
    console.log('\n🍔 Baixando imagens de burgers...');
    for (const [nome, url] of Object.entries(IMAGENS_BURGERS)) {
        const filepath = path.join('frontend/images/burgers', `${nome}.png`);
        try {
            await downloadImage(url, filepath);
            console.log(`  ✅ ${nome}.png`);
        } catch (err) {
            console.log(`  ❌ Erro ao baixar ${nome}.png:`, err.message);
        }
    }

    console.log('\n✅ Download concluído!');
}

async function main() {
    try {
        await criarDiretorios();
        await baixarImagens();
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}

main();
