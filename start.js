#!/usr/bin/env node

const { spawn } = require('child_process');
const isLocal = process.env.NODE_ENV !== 'production' && !process.env.RENDER;
const isRender = !!process.env.RENDER || process.env.NODE_ENV === 'production';
let open;
if (isLocal) {
  try {
    open = require('open');
  } catch (err) {
    open = null;
  }
}

console.log('🍔 CHICO GRILL Delivery - Iniciando...\n');

if (isLocal && open) {
  // Aguardar um pouco antes de abrir o navegador
  setTimeout(() => {
    console.log('🌐 Abrindo navegador...\n');
    open('http://localhost:5000').catch(() => {});
  }, 3000);
}

// Em Render ou produção, apenas iniciar o backend. Localmente iniciamos frontend também.
const backend = spawn('npm', ['--prefix', 'backend', 'start'], {
  stdio: 'inherit',
  shell: true,
});

let frontend;
if (isLocal) {
  frontend = spawn('npm', ['--prefix', 'frontend', 'start'], {
    stdio: 'inherit',
    shell: true,
  });
}

process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando servidores...');
  backend.kill();
  if (frontend) frontend.kill();
  process.exit(0);
});
