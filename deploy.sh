#!/bin/bash
# Script de deploy para Hetzner + DuckDNS
# Uso: bash deploy.sh
set -e

echo "=== Neros Deploy Script ==="

# Configuracoes
DOMAIN="${DUCK_DNS_DOMAIN:-neros}.duckdns.org"
TOKEN="${DUCK_DNS_TOKEN}"
SERVER_IP=$(curl -s ifconfig.me)

# 1. Atualizar DuckDNS
echo "[1/5] Atualizando DuckDNS..."
curl -s "https://www.duckdns.org/update?domains=${DUCK_DNS_DOMAIN}&token=${TOKEN}&ip=${SERVER_IP}"
echo ""

# 2. Instalar Docker se necessario
echo "[2/5] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 3. Configurar SSL / Certbot
echo "[3/5] Configurando SSL..."
if [ ! -d "certbot/conf/live/$DOMAIN" ]; then
    sudo docker-compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --email admin@$DOMAIN --agree-tos --no-eff-email" certbot
fi

# 4. Build e start dos containers
echo "[4/5] Buildando e iniciando containers..."
sudo docker-compose build
sudo docker-compose up -d

# 5. Rodar migrations
echo "[5/5] Executando migrations..."
sudo docker-compose exec -T backend npx prisma migrate deploy

echo ""
echo "=== Deploy concluido! ==="
echo "Acesse: https://$DOMAIN"
echo ""
echo "Comandos uteis:"
echo "  docker-compose logs -f   # Ver logs"
echo "  docker-compose restart   # Reiniciar"
echo "  docker-compose down      # Parar"
