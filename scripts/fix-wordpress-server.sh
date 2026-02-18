#!/bin/bash
# แก้ WP ล่ม — รันบนเซิร์ฟเวอร์ root@amphon-app-prod
# Usage: bash fix-wordpress-server.sh

set -e
WP_DIR="${WP_DIR:-/opt/wordpress}"
echo "📍 WP dir: $WP_DIR"
cd "$WP_DIR" || exit 1

echo "1️⃣ Restarting Docker..."
docker compose down
docker compose up -d
sleep 5
docker compose ps

echo ""
echo "2️⃣ Updating crontab for wp-cron..."
(crontab -l 2>/dev/null | grep -v "wp-cron.php" || true; echo "*/5 * * * * curl -s -o /dev/null https://cms.webuy.in.th/wp-cron.php?doing_wp_cron") | crontab -
echo "✅ Crontab done"

echo ""
echo "📋 Manual steps (see FIX-ALL-TODAY.md):"
echo "   - Edit docker-compose: disable healthcheck, DISABLE_WP_CRON=1, memory 1536M"
echo "   - Edit Nginx: location = /graphql, proxy_read_timeout 120s"
echo "   - docker compose down && docker compose up -d"
