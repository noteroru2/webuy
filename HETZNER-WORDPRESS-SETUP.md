# ติดตั้ง WordPress บน Hetzner VPS (ที่มี Docker อยู่แล้ว)

## ✅ ข้อมูล VPS ของคุณ

จากรูป htop:
- **CPU:** 2 cores (load ต่ำมาก ~0.07-0.85)
- **RAM:** ~4GB (ใช้อยู่ ~50%, เหลืออีก ~2GB)
- **Docker:** ✅ พร้อมใช้งาน
- **Plan:** Hetzner CX21 (2 CPU, 4GB RAM, 40GB SSD)

**สรุป:** 🟢 **มี Resources เพียงพอสำหรับ WordPress!**

---

## 🚀 ขั้นตอนการติดตั้ง

### ขั้นที่ 1: SSH เข้า Hetzner VPS

```bash
ssh root@your-server-ip
```

---

### ขั้นที่ 2: สร้าง Docker Compose สำหรับ WordPress

```bash
# สร้าง directory
mkdir -p /opt/wordpress
cd /opt/wordpress

# สร้างไฟล์ docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  wordpress:
    image: wordpress:6.4-php8.2-apache
    container_name: webuy-wordpress
    restart: always
    ports:
      - "8080:80"  # WordPress จะอยู่ port 8080
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: WeBuy2026SecurePass!
      WORDPRESS_DB_NAME: wordpress_webuy
      WORDPRESS_CONFIG_EXTRA: |
        /* Memory & Performance */
        define('WP_MEMORY_LIMIT', '256M');
        define('WP_MAX_MEMORY_LIMIT', '512M');
        define('WP_POST_REVISIONS', 5);
        define('AUTOSAVE_INTERVAL', 300);
    volumes:
      - wordpress_data:/var/www/html
      - ./uploads.ini:/usr/local/etc/php/conf.d/uploads.ini
    depends_on:
      - mysql
    networks:
      - webuy-network
    mem_limit: 1g  # จำกัด memory ไม่ให้เกิน 1GB

  mysql:
    image: mysql:8.0
    container_name: webuy-mysql
    restart: always
    environment:
      MYSQL_DATABASE: wordpress_webuy
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: WeBuy2026SecurePass!
      MYSQL_ROOT_PASSWORD: RootPass2026Secure!
      MYSQL_CHARSET: utf8mb4
      MYSQL_COLLATION: utf8mb4_unicode_ci
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql.cnf:/etc/mysql/conf.d/custom.cnf
    networks:
      - webuy-network
    mem_limit: 512m  # จำกัด memory ไม่ให้เกิน 512MB
    command: --default-authentication-plugin=mysql_native_password

volumes:
  wordpress_data:
    driver: local
  mysql_data:
    driver: local

networks:
  webuy-network:
    driver: bridge
EOF
```

---

### ขั้นที่ 3: สร้างไฟล์ config เพิ่มเติม

**A. PHP uploads config:**
```bash
cat > uploads.ini << 'EOF'
file_uploads = On
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_time = 300
EOF
```

**B. MySQL config:**
```bash
cat > mysql.cnf << 'EOF'
[mysqld]
max_connections = 50
key_buffer_size = 16M
max_allowed_packet = 64M
table_open_cache = 256
sort_buffer_size = 1M
read_buffer_size = 1M
read_rnd_buffer_size = 4M
myisam_sort_buffer_size = 8M
thread_cache_size = 8
query_cache_size = 16M
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
EOF
```

---

### ขั้นที่ 4: Start WordPress

```bash
# Start containers
docker-compose up -d

# ตรวจสอบว่า running
docker ps

# ควรเห็น:
# webuy-wordpress  (port 8080)
# webuy-mysql      (port 3306)

# ดู logs
docker-compose logs -f wordpress
```

---

### ขั้นที่ 5: ตั้งค่า Nginx Reverse Proxy (ถ้ามี)

**ถ้าคุณใช้ nginx อยู่แล้ว** สำหรับ frontend/API:

```bash
# สร้าง nginx config สำหรับ WordPress
cat > /etc/nginx/sites-available/wordpress << 'EOF'
server {
    listen 80;
    server_name cms.webuy.in.th;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cms.webuy.in.th;
    
    # SSL Certificate (ติดตั้งทีหลังด้วย certbot)
    ssl_certificate /etc/letsencrypt/live/cms.webuy.in.th/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.webuy.in.th/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WordPress admin uploads
        client_max_body_size 64M;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

### ขั้นที่ 6: ตั้งค่า SSL (Let's Encrypt - ฟรี)

```bash
# Install Certbot
apt update
apt install certbot python3-certbot-nginx -y

# Get SSL Certificate
certbot --nginx -d cms.webuy.in.th

# Test auto-renewal
certbot renew --dry-run
```

---

### ขั้นที่ 7: ตั้งค่า DNS (Hetzner)

1. ไปที่ [Hetzner DNS Console](https://dns.hetzner.com/)
2. เพิ่ม A Record:
   ```
   Type: A
   Name: cms
   Value: [IP ของ VPS]
   TTL: 300
   ```

**ผลลัพธ์:** `cms.webuy.in.th` → WordPress บน VPS

---

### ขั้นที่ 8: เข้า WordPress Setup

เปิดเบราว์เซอร์:
```
http://your-server-ip:8080
หรือ
https://cms.webuy.in.th (ถ้าตั้งค่า DNS + SSL แล้ว)
```

**WordPress Setup Wizard:**
1. เลือกภาษา: ไทย
2. กรอกข้อมูล:
   - Site Title: WEBUY HUB CMS
   - Username: admin
   - Password: [strong password]
   - Email: your-email@example.com
3. คลิก **Install WordPress**

---

### ขั้นที่ 9: ติดตั้ง Plugins

เข้า WordPress Admin → Plugins → Add New:

1. **WPGraphQL** (สำคัญที่สุด!)
   - Install and Activate
   - Settings → GraphQL → Enable

2. **Pods Admin**
   - Install and Activate
   - ใช้สร้าง custom post types (Location Pages, Services, Prices, etc.)

3. **All-in-One WP Migration** (สำหรับ migrate data)
   - Install and Activate

4. **Redis Object Cache** (แนะนำ - เพิ่ม performance)
   - Install Redis:
     ```bash
     docker run -d --name redis \
       --network wordpress_webuy-network \
       -p 6379:6379 \
       redis:alpine
     ```
   - Install plugin: Redis Object Cache
   - Enable Object Cache

---

### ขั้นที่ 10: Migrate Data จาก Hostatomwp

**วิธีที่ 1: All-in-One WP Migration (ง่ายที่สุด)**

**ใน Hostatomwp (WordPress เดิม):**
```
1. Plugins → All-in-One WP Migration
2. Export → File
3. Download .wpress file
```

**ใน Hetzner (WordPress ใหม่):**
```
1. Plugins → All-in-One WP Migration
2. Import → Upload .wpress file
3. รอ import เสร็จ (~5-15 นาที)
4. Done!
```

**วิธีที่ 2: Manual (ถ้าไฟล์ใหญ่เกิน 512MB)**
```bash
# 1. Export Database จาก Hostatomwp
# 2. Download wp-content/uploads/
# 3. Import database ใหม่
# 4. Upload uploads/ folder
```

---

### ขั้นที่ 11: Test GraphQL Endpoint

```bash
# Test ว่า GraphQL ทำงาน
curl -X POST https://cms.webuy.in.th/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ locationPages(first: 5) { nodes { slug title } } }"
  }'
```

**ผลลัพธ์ที่คาดหวัง:**
```json
{
  "data": {
    "locationPages": {
      "nodes": [
        {"slug": "ubon-ratchathani", "title": "รับซื้อโน๊ตบุ๊คอุบลราชธานี"},
        ...
      ]
    }
  }
}
```

---

### ขั้นที่ 12: อัปเดต Vercel Environment Variables

ไปที่ [Vercel Dashboard](https://vercel.com/dashboard):

**แก้ไข:**
```
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/graphql
```

**เดิม:**
```
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/webuy/graphql
```

→ Save → Redeploy

---

### ขั้นที่ 13: Test Build

**ควรเห็น:**
```
Build Time: 30-60 วินาที (จากเดิม 7 นาที)
✅ Generating 39/39 static pages
✓ Build successful
```

---

## 📊 Resource Planning

### **ปัจจุบัน (จากรูป):**
```
CPU:  ~10% usage → เหลือ 90% ✅
RAM:  ~50% usage → เหลือ ~2GB ✅
Load: 0.07-0.89 → ต่ำมาก ✅
```

### **หลังลง WordPress:**
```
WordPress + MySQL: ~800MB-1GB RAM
n8n:              ~300-500MB
Amphon API:       ~200-400MB
Frontend:         ~100-200MB
-----------------------------------
Total:            ~1.4-2.2GB / 4GB
Available:        ~1.8-2.6GB ✅ พอดี!
```

**สรุป:** **ลงได้สบายๆ ครับ!** ไม่ต้อง upgrade

---

## ⚙️ Docker Compose สำหรับ Hetzner

```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:6.4-php8.2-apache
    container_name: webuy-wordpress
    restart: always
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: WeBuy2026Secure!
      WORDPRESS_DB_NAME: wordpress_webuy
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_MEMORY_LIMIT', '256M');
        define('WP_MAX_MEMORY_LIMIT', '512M');
    volumes:
      - wordpress_data:/var/www/html
    networks:
      - webuy-network
    mem_limit: 1g
    cpus: 1

  mysql:
    image: mysql:8.0
    container_name: webuy-mysql
    restart: always
    environment:
      MYSQL_DATABASE: wordpress_webuy
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: WeBuy2026Secure!
      MYSQL_ROOT_PASSWORD: Root2026Secure!
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - webuy-network
    mem_limit: 512m
    cpus: 0.5
    command: >
      --default-authentication-plugin=mysql_native_password
      --max_connections=50
      --innodb_buffer_pool_size=128M

  redis:
    image: redis:alpine
    container_name: webuy-redis
    restart: always
    networks:
      - webuy-network
    mem_limit: 128m
    cpus: 0.25

volumes:
  wordpress_data:
  mysql_data:

networks:
  webuy-network:
    driver: bridge
```

**Start:**
```bash
docker-compose up -d
docker ps  # เช็คว่า running
```

---

## 🌐 ตั้งค่า Nginx Reverse Proxy

**ถ้าคุณใช้ nginx สำหรับ frontend/API:**

```nginx
# /etc/nginx/sites-available/wordpress
server {
    listen 80;
    server_name cms.webuy.in.th;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        client_max_body_size 64M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Enable:**
```bash
ln -s /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

**ตั้งค่า SSL:**
```bash
certbot --nginx -d cms.webuy.in.th
```

---

## 🔄 Migrate Data จาก Hostatomwp

### ขั้นที่ 1: Export จาก WordPress เดิม

**ใช้ All-in-One WP Migration:**
```
1. WordPress เดิม → Plugins → All-in-One WP Migration
2. Export → File
3. Download .wpress file (รอ 5-10 นาที)
```

### ขั้นที่ 2: Import ใน WordPress ใหม่

```
1. WordPress ใหม่ (Hetzner) → Plugins → All-in-One WP Migration
2. Import → Upload .wpress file
3. รอ import เสร็จ (~10-20 นาที)
4. เสร็จ! ข้อมูลย้ายครบแล้ว
```

**ตรวจสอบ:**
- Location Pages ครบหรือไม่
- Services, Prices, FAQs, Categories ครบหรือไม่
- Custom Fields (Pods) ยังอยู่หรือไม่

---

## ✅ อัปเดต Next.js Config

**ใน Vercel Environment Variables:**
```
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/graphql
```

**Local .env.local:**
```bash
# c:\Users\User\Desktop\webuy-hub-v2\.env.local
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/graphql
SITE_URL=http://localhost:3001
SITE_KEY=webuy
```

**Local .env.production:**
```bash
# c:\Users\User\Desktop\webuy-hub-v2\.env.production
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/graphql
SITE_URL=https://webuy.in.th
SITE_KEY=webuy
```

---

## 🧪 Test Build

```bash
cd c:\Users\User\Desktop\webuy-hub-v2
npm run build
```

**ผลลัพธ์ที่คาดหวัง:**
```
Build Time: 30-60 วินาที (จากเดิม 7 นาที!)
✅ Generating 39/39 static pages
✓ Build successful
```

---

## 📊 Performance Comparison

| Metric | Hostatomwp (เดิม) | Hetzner VPS (ใหม่) | Improvement |
|--------|-------------------|---------------------|-------------|
| **Build Time** | 7 นาที | 30-60 วินาที | 🟢 7x เร็วขึ้น |
| **Timeout** | บ่อย (10s) | ไม่มี | 🟢 100% ลด |
| **Deploy Success** | 20% | 100% | 🟢 5x ดีขึ้น |
| **WordPress Speed** | ช้า | เร็ว | 🟢 3-5x เร็วขึ้น |
| **Concurrent Requests** | ไม่รองรับ | รองรับ | 🟢 Fixed! |
| **Scalability** | ไม่ได้ | ได้ | 🟢 ขยายได้ |

---

## 🔍 Monitoring

### ตรวจสอบ Resource Usage:

```bash
# 1. Docker stats
docker stats

# 2. Overall system
htop

# 3. Disk space
df -h

# 4. Memory
free -h
```

**Threshold:**
- RAM usage > 80% → พิจารณา optimize/upgrade
- CPU load > 2.0 → พิจารณา upgrade
- Disk > 90% → เพิ่ม storage

---

## ⚠️ Troubleshooting

### ปัญหา 1: Out of Memory

**วิธีแก้:**
```bash
# เพิ่ม swap space
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### ปัญหา 2: WordPress ช้า

**วิธีแก้:**
```bash
# Install Redis Object Cache
docker run -d --name redis \
  --network wordpress_webuy-network \
  redis:alpine

# ใน WordPress: Install "Redis Object Cache" plugin
```

### ปัญหา 3: MySQL slow queries

**วิธีแก้:**
```bash
# Optimize tables
docker exec -it webuy-mysql mysql -u root -p
OPTIMIZE TABLE wp_posts, wp_postmeta, wp_options;
```

---

## ✅ Checklist

**ก่อนเริ่ม:**
- [ ] Backup WordPress เดิม (Hostatomwp)
- [ ] ตรวจสอบ VPS resources (htop, free -h, df -h)
- [ ] เตรียม domain/subdomain (cms.webuy.in.th)

**ระหว่างติดตั้ง:**
- [ ] สร้าง docker-compose.yml
- [ ] Start WordPress + MySQL containers
- [ ] ตั้งค่า nginx reverse proxy
- [ ] ตั้งค่า SSL (Let's Encrypt)
- [ ] Migrate data (All-in-One WP Migration)

**หลังติดตั้ง:**
- [ ] Install WPGraphQL plugin
- [ ] Install Pods Admin
- [ ] Test GraphQL endpoint
- [ ] อัปเดต Vercel env vars
- [ ] Test build Next.js
- [ ] Deploy to Vercel
- [ ] Verify ทุกหน้าทำงาน

---

## 💰 ค่าใช้จ่าย

### Hetzner VPS CX21:
- **ราคา:** €5.83/เดือน (~200฿)
- **Specs:** 2 CPU, 4GB RAM, 40GB SSD
- **เพียงพอสำหรับ:** n8n + Amphon + Frontend + **WordPress**

**ไม่ต้องจ่ายเพิ่ม!** ใช้ VPS ที่มีอยู่ได้เลย ✅

---

## 🎯 Timeline

- **Setup WordPress:** 15-30 นาที
- **Migrate Data:** 30-60 นาที
- **Test & Deploy:** 15-30 นาที
- **Total:** ~1-2 ชั่วโมง

---

## 📞 ต้องการความช่วยเหลือ?

**ผมช่วยได้:**
- Step-by-step setup WordPress บน Hetzner
- Migrate data จาก Hostatomwp
- ตั้งค่า nginx reverse proxy
- Setup SSL certificate
- Test GraphQL endpoint
- Deploy Next.js

**บอกผมได้เลยครับ!** 💪🚀

---

**สร้างโดย:** WEBUY HUB Team  
**วันที่:** 2026-02-07
