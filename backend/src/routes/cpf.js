const express = require('express');
const router = express.Router();

// Rota simples de lookup de CPF (mock)
// GET /api/cpf/:cpf
router.get('/:cpf', (req, res) => {
  const raw = req.params.cpf || '';
  const cpf = raw.replace(/\D/g, '');
  if (cpf.length !== 11) return res.status(400).json({ success: false, error: 'CPF inválido' });

  // Mock: gerar dados fictícios baseados nos últimos dígitos
  const suffix = cpf.slice(-2);
  const pessoa = {
    cpf,
    nome: `Cliente ${suffix}`,
    data_nascimento: '1990-01-01',
    endereco: 'Rua Exemplo, 123',
    cidade: 'Cidade Exemplo',
    estado: 'SP',
  };

  return res.json({ success: true, pessoa });
});

module.exports = router;
