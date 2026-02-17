# แก้ WordPress ล่ม (504 / 502 / unhealthy)

ทำตามลำดับบน **เซิร์ฟเวอร์** (ที่รัน Docker + Nginx เช่น amphon-app-prod)

---

## ⚡ ถ้าล่มหลัง build หรือ ISR (healthy → unhealthy)

ตอน Next.js build หรือ ISR ยิง WP พร้อมกันหลาย request → WP ช้า → **healthcheck ไม่ผ่าน** → Docker แปะสถานะ `(unhealthy)` (และอาจ restart)

**แก้ทันที:** ปิด healthcheck แล้ว recreate container

```bash
cd /opt/wordpress   # path ที่รัน docker compose
nano docker-compose.yml   # หรือ vi
```

ใน service **wordpress** ให้ **ลบหรือ comment ทั้งบล็อก healthcheck** ออก เช่น:

```yaml
# ลบหรือใส่ # ด้านหน้า 4 บรรทัดนี้
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost/"]
#   interval: 30s
#   timeout: 10s
#   retries: 3
```

บันทึกแล้วรัน:

```bash
docker compose down
docker compose up -d
docker ps
```

หลังนี้สถานะจะแสดง **Up X minutes** โดยไม่มี `(unhealthy)` — container จะไม่โดน mark ล่มแค่เพราะ WP ช้าชั่วคราว

---

## ขั้นที่ 1: เช็กสถานะ

```bash
cd /opt/wordpress   # หรือ path ที่ใช้
docker compose ps
docker compose logs wordpress --tail 80
```

- ถ้า `(unhealthy)` หรือไม่ขึ้น → ต้องแก้ config แล้ว restart
- ถ้าเห็น error เกี่ยวกับ memory / timeout → ทำขั้น 2–3

---

## ขั้นที่ 2: แก้ Docker (WordPress container)

บนเซิร์ฟเวอร์ แก้ไฟล์ `docker-compose.yml` (หรือ copy จาก repo ไฟล์ `docker-compose-wordpress-fixed.yml` แล้วปรับ path/volume ตรงกับของจริง)

### 2.1 เพิ่ม memory + ปิด cron ใน container

ใน service **wordpress** เพิ่ม/แก้:

```yaml
environment:
  WORDPRESS_DB_HOST: mysql
  WORDPRESS_DB_USER: wordpress
  WORDPRESS_DB_PASSWORD: wordpress_password
  WORDPRESS_DB_NAME: wordpress
  DISABLE_WP_CRON: "1"   # ปิด cron ใน container — ใช้ crontab รันจากนอกแทน
```

และใน **deploy.resources.limits**:

```yaml
deploy:
  resources:
    limits:
      memory: 1536M    # 1.5G (เดิม 768M อาจน้อย)
      cpus: "1.0"
```

### 2.2 ปิด healthcheck (สำคัญ — กัน unhealthy ตอน build/ISR)

ถ้า container ขึ้นเป็น `(unhealthy)` บ่อย **โดยเฉพาะหลัง build หรือตอน ISR** ให้ **ลบหรือ comment ทั้งบล็อก healthcheck** ออกจาก service wordpress (ไม่ต้องมี healthcheck เลย):

```yaml
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost/"]
#   interval: 30s
#   timeout: 10s
#   retries: 3
```

จากนั้น `docker compose down` แล้ว `docker compose up -d` อีกครั้ง. หลังนี้จะแสดงแค่ **Up X minutes** ไม่มี (unhealthy). ค่อยเปิด healthcheck กลับเมื่อ WP แข็งแรงและมี resource เพิ่มแล้ว

### 2.3 รัน WP-Cron จากนอก (เพราะปิดใน container)

บนเซิร์ฟเวอร์ (host) รัน:

```bash
crontab -e
```

เพิ่มบรรทัด (รัน wp-cron ทุก 5 นาที):

```
*/5 * * * * curl -s -o /dev/null https://cms.webuy.in.th/wp-cron.php?doing_wp_cron
```

บันทึกแล้วออก

### 2.4 Apply Docker

```bash
cd /opt/wordpress
docker compose down
docker compose up -d
docker compose ps
docker compose logs wordpress --tail 30
```

---

## ขั้นที่ 3: แก้ Nginx (กัน 504 Gateway Time-out)

หน้า admin (เช่น edit.php?post_type=service) โหลดช้า → Nginx ต้องรอนานขึ้น และใช้ upstream แบบมี keepalive

### 3.1 แก้ config ของ cms.webuy.in.th

แก้ไฟล์ที่ใช้กับ cms (เช่น `/etc/nginx/sites-available/wordpress` หรือใน `sites-enabled/`):

```nginx
upstream wordpress_backend {
    server 127.0.0.1:8080;
    keepalive 8;
    # ไม่ใส่ max_fails ถ้าไม่อยากให้ Nginx ปิด upstream ชั่วคราวตอน 502
}

server {
    listen 80;
    server_name cms.webuy.in.th;
    # ถ้ามี SSL ก็ listen 443 ssl; ...

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
```

- **proxy_read_timeout 120s** = รอ PHP ได้นาน 2 นาที (ลด 504)
- **keepalive 8** = รีไซเคิล connection ไป container

### 3.2 ทดสอบแล้ว reload

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## ขั้นที่ 4: (ถ้ายังล่ม) เพิ่ม memory ใน PHP

ถ้า log มี "Allowed memory size exhausted":

1. สร้างไฟล์ในโปรเจกต์ Docker เช่น `php-extra.ini`:

```ini
memory_limit = 256M
max_execution_time = 120
```

2. ใน docker-compose service wordpress เพิ่ม volume:

```yaml
volumes:
  - ./php-extra.ini:/usr/local/etc/php/conf.d/99-extra.ini:ro
```

3. `docker compose up -d --force-recreate wordpress`

---

## สรุปลำดับทำ

| ลำดับ | ทำอะไร |
|-------|--------|
| 1 | เช็ก `docker compose ps` และ `logs wordpress` |
| 2 | แก้ docker-compose: memory 1.5G, DISABLE_WP_CRON=1, (ปิด healthcheck) |
| 3 | ตั้ง crontab รัน wp-cron.php ทุก 5 นาที |
| 4 | `docker compose down && docker compose up -d` |
| 5 | แก้ Nginx: upstream + proxy_read_timeout 120s |
| 6 | `nginx -t && systemctl reload nginx` |

หลังทำแล้วลองเปิด https://cms.webuy.in.th/wp-admin และหน้า edit.php?post_type=service อีกครั้ง
