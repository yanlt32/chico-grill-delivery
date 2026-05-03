# Imagens de Produtos - Chico Grill Delivery

Este diretório armazena as imagens dos produtos do cardápio.

## Estrutura de Pastas

```
images/
├── espetos/        # Imagens de espetos
├── burgers/        # Imagens de burgers
└── bebidas/        # Imagens de bebidas
```

## Convenção de Nomeação de Arquivos

As imagens devem ser nomeadas removendo o prefixo do ID do produto:

### Espetos (pasta: `espetos/`)
- `carne.png` → id: `esp_carne`
- `misto.png` → id: `esp_misto`
- `kafta.png` → id: `esp_kafta`
- `coracao.png` → id: `esp_coracao`
- `tulipa.png` → id: `esp_tulipa`
- `panceta.png` → id: `esp_panceta`
- `paoalho.png` → id: `esp_paoalho`
- `frango.png` → id: `esp_frango`
- `queijo.png` → id: `esp_queijo`
- `toscana.png` → id: `esp_toscana`
- `apimentada.png` → id: `esp_apimentada`

### Burgers (pasta: `burgers/`)
- `burger_najla.png` → id: `burger_najla`
- `burger_jojo.png` → id: `burger_jojo`
- `burger_toguro.png` → id: `burger_toguro`
- `burger_bony.png` → id: `burger_bony`
- `burger_picanha.png` → id: `burger_picanha`
- `burger_espeto.png` → id: `burger_espeto`
- `burger_espeto_duplo.png` → id: `burger_espeto_duplo`

### Bebidas (pasta: `bebidas/`)
- `heineken.png` → id: `bebida_heineken`
- `stella.png` → id: `bebida_stella`
- `budweiser.png` → id: `bebida_budweiser`
- `eisenbahn.png` → id: `bebida_eisenbahn`
- `brahma.png` → id: `bebida_brahma`
- `skol.png` → id: `bebida_skol`
- `amstel.png` → id: `bebida_amstel`

## Formatos Suportados

- `.png` (recomendado)
- `.jpg` / `.jpeg`
- `.webp`

## Como Adicionar Imagens

1. Coloque a imagem na pasta apropriada (`espetos/`, `burgers/` ou `bebidas/`)
2. Nomeie o arquivo seguindo a convenção acima (remova o prefixo do ID)
3. As imagens serão automaticamente carregadas pelo aplicativo

## Exemplo

Para adicionar a imagem de carne em `backend/public/images/espetos/carne.png`:
- O sistema procurará automaticamente em `/public/images/espetos/carne.png`
- A imagem será exibida para o produto com id `esp_carne`

## URLs das Imagens

As imagens são acessadas via:
`http://seu-servidor:porta/public/images/categoria/arquivo.png`

Exemplo:
`http://localhost:3000/public/images/espetos/carne.png`
