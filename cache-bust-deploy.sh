#!/bin/bash

echo "🔥 CACHE BUST DEPLOY - Limpeza total de cache"
echo "=============================================="

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

set -e

echo -e "${YELLOW}1. Git pull...${NC}"
git pull
echo -e "${GREEN}✓ Código atualizado${NC}"
echo ""

echo -e "${YELLOW}2. Limpando TUDO do frontend...${NC}"
cd frontend
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache frontend limpo${NC}"
echo ""

echo -e "${YELLOW}3. Instalando dependências...${NC}"
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

echo -e "${YELLOW}4. Building frontend (produção)...${NC}"
VITE_BUILD_TIME=$(date +%s) npm run build
echo -e "${GREEN}✓ Frontend buildado com timestamp: $(date)${NC}"
echo ""

echo -e "${YELLOW}5. Verificando build...${NC}"
ls -lh dist/assets/ | head -5
echo ""

cd ..

echo -e "${YELLOW}6. Removendo imagem nginx antiga completamente...${NC}"
docker rmi senshi-habits-nginx:latest -f || true
docker image prune -f
echo -e "${GREEN}✓ Imagens antigas removidas${NC}"
echo ""

echo -e "${YELLOW}7. Building nginx (SEM CACHE, build novo)...${NC}"
docker build --no-cache --pull -t senshi-habits-nginx:latest -f nginx/Dockerfile .
echo -e "${GREEN}✓ Nova imagem criada${NC}"
echo ""

echo -e "${YELLOW}8. Forçando atualização do serviço nginx...${NC}"
docker service update --force --image senshi-habits-nginx:latest senshi-habits_nginx
echo -e "${GREEN}✓ Serviço atualizado${NC}"
echo ""

echo -e "${YELLOW}9. Aguardando serviço reiniciar (30s)...${NC}"
sleep 30
echo ""

echo -e "${YELLOW}10. Status do serviço:${NC}"
docker service ps senshi-habits_nginx --no-trunc --format "table {{.Name}}\t{{.Image}}\t{{.CurrentState}}" | head -5
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ CACHE BUST CONCLUÍDO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${RED}AGORA É CRÍTICO LIMPAR O CLOUDFLARE:${NC}"
echo ""
echo -e "${YELLOW}PASSO A PASSO CLOUDFLARE:${NC}"
echo "1. Acesse: https://dash.cloudflare.com"
echo "2. Selecione seu domínio: aytt.com.br"
echo "3. No menu lateral, clique em 'Caching'"
echo "4. Clique no botão 'Purge Cache'"
echo "5. Selecione 'Purge Everything'"
echo "6. Confirme a purga"
echo "7. Aguarde 2-3 minutos"
echo ""
echo -e "${YELLOW}DEPOIS NO NAVEGADOR:${NC}"
echo "1. Feche TODAS as abas do seu site"
echo "2. Pressione Ctrl+Shift+Delete"
echo "3. Selecione 'Todo o período'"
echo "4. Marque 'Imagens e arquivos em cache'"
echo "5. Clique em 'Limpar dados'"
echo "6. Abra uma aba anônima (Ctrl+Shift+N)"
echo "7. Acesse seu site na aba anônima"
echo ""
echo -e "${RED}Se ainda mostrar erro, me avise e vou investigar mais profundamente.${NC}"
