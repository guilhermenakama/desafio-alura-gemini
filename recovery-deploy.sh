#!/bin/bash

echo "🔥 RECOVERY DEPLOY - Sistema completo"
echo "======================================"

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

echo -e "${YELLOW}2. Limpando cache do Docker...${NC}"
docker system prune -f
echo -e "${GREEN}✓ Cache limpo${NC}"
echo ""

echo -e "${YELLOW}3. Rebuilding BACKEND (sem cache + limpeza Python)...${NC}"
docker build --no-cache -t senshi-habits-backend:latest -f backend/Dockerfile.prod backend/
echo -e "${GREEN}✓ Backend buildado${NC}"
echo ""

echo -e "${YELLOW}4. Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✓ Frontend buildado${NC}"
echo ""

echo -e "${YELLOW}5. Rebuilding NGINX...${NC}"
docker build --no-cache -t senshi-habits-nginx:latest -f nginx/Dockerfile .
echo -e "${GREEN}✓ Nginx buildado${NC}"
echo ""

echo -e "${YELLOW}6. Atualizando stack (com novo Gunicorn config)...${NC}"
docker stack deploy -c docker-compose.stack.yml senshi-habits
echo -e "${GREEN}✓ Stack atualizado${NC}"
echo ""

echo -e "${YELLOW}7. Aguardando serviços subirem (30s)...${NC}"
sleep 30
echo ""

echo -e "${YELLOW}8. Status dos serviços:${NC}"
docker service ls | grep senshi
echo ""
docker service ps senshi-habits_backend --no-trunc --format "table {{.Name}}\t{{.CurrentState}}" | head -3
docker service ps senshi-habits_nginx --no-trunc --format "table {{.Name}}\t{{.CurrentState}}" | head -3
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ RECOVERY COMPLETO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "1. Teste os filtros de data no Histórico"
echo "2. Limpe o cache do Cloudflare"
echo "3. Faça hard refresh (Ctrl+Shift+R)"
