#!/usr/bin/env node

const { spawn } = require('child_process');
const open = require('open');

console.log('🍔 CHICO GRILL Delivery - Iniciando...\n');

// Aguardar um pouco antes de abrir o navegador
setTimeout(() => {
  console.log('🌐 Abrindo navegador...\n');
  open('http://localhost:5000');
}, 3000);

// Rodar backend e frontend em paralelo
const backend = spawn('npm', ['--prefix', 'backend', 'start'], {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['--prefix', 'frontend', 'start'], {
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando servidores...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
