#!/bin/bash

# Setup Nginx + SSL for cms.webuy.in.th
# Run on Hetzner VPS

set -e

echo "🚀 Setting up Nginx reverse proxy for cms.webuy.in.th..."

# 1. Create Nginx config (upstream + 120s read timeout — กัน 504)
cat > /etc/nginx/sites-available/wordpress << 'EOF'
upstream wordpress_backend {
    server 127.0.0.1:8080;
    keepalive 8;
}
server {
    listen 80;
    server_name cms.webuy.in.th;
    client_max_body_size 64M;
    location / {
        proxy_pass http://wordpress_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
EOF

echo "✅ Nginx config created"

# 2. Enable site
ln -sf /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/

echo "✅ Site enabled"

# 3. Test Nginx config
nginx -t

echo "✅ Nginx config test passed"

# 4. Reload Nginx
systemctl reload nginx

echo "✅ Nginx reloaded"

echo ""
echo "📝 Next steps:"
echo "1. Wait for DNS propagation (5-10 minutes)"
echo "2. Test: http://cms.webuy.in.th"
echo "3. Run SSL install: certbot --nginx -d cms.webuy.in.th"
echo ""
echo "🎯 Current status:"
echo "   HTTP:  http://cms.webuy.in.th (should work when DNS propagates)"
echo "   HTTPS: Pending (run certbot after DNS works)"
