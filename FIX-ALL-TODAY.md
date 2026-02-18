# แก้ 404 + WP ล่ม ให้จบวันนี้

ทำตามลำดับ — ส่วนใหญ่รันบน **เซิร์ฟเวอร์** (root@amphon-app-prod)

---

## ส่วนที่ 1: แก้ WordPress ล่ม (บนเซิร์ฟเวอร์)

### 1.1 เข้าโฟลเดอร์ WP

```bash
cd /opt/wordpress
```

### 1.2 ปิด healthcheck ใน docker-compose.yml

```bash
nano docker-compose.yml
```

หา service **wordpress** → **ลบหรือ comment บล็อก healthcheck** ทั้งหมด:

```yaml
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost/"]
#   interval: 30s
#   timeout: 10s
#   retries: 3
```

### 1.3 ตรวจให้มี DISABLE_WP_CRON และ memory

ใน environment ของ wordpress ต้องมี:

```yaml
DISABLE_WP_CRON: "1"
```

ใน deploy.resources.limits:

```yaml
memory: 1536M
cpus: "1.0"
```

### 1.4 รีสตาร์ท Docker

```bash
docker compose down
docker compose up -d
docker ps
```

### 1.5 ตั้ง crontab รัน wp-cron

```bash
crontab -e
```

เพิ่มบรรทัด:

```
*/5 * * * * curl -s -o /dev/null https://cms.webuy.in.th/wp-cron.php?doing_wp_cron
```

### 1.6 แก้ Nginx (403 / 504)

เปิด config ของ cms (เช่น `/etc/nginx/sites-enabled/wordpress`):

```bash
sudo nano /etc/nginx/sites-enabled/wordpress
```

**ตรวจให้มี:**
- `location = /graphql` ที่ proxy ไป backend และส่ง `X-WEBUY-SECRET` ต่อ
- `proxy_read_timeout 120s`
- upstream ใช้ `keepalive 8`

ใช้ตัวอย่างจาก `docs/nginx-wordpress-cms.conf`  
**สำคัญ:** ถ้ามี `if ($http_x_webuy_secret != "...") { return 403; }` อยู่แล้ว ต้องให้ค่าใน Vercel ตรงกับค่าใน Nginx

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## ส่วนที่ 2: แก้ 404 (ฝั่ง Vercel + cache)

### 2.1 ตั้งค่า Vercel ให้ถูก

- `WEBUY_GQL_SECRET` = ค่าที่ตรงกับ Nginx (ไม่ตั้ง `WEBUY_GQL_SEND_SECRET=0`)
- `WPGRAPHQL_ENDPOINT` หรือ `WP_GRAPHQL_URL` = `https://cms.webuy.in.th/graphql` (หรือ path จริง ถ้าใช้ /webuy/graphql)

### 2.2 Redeploy แบบ Clear Build Cache

Vercel → Deployments → ⋯ → Redeploy → เลือก **Clear Build Cache**

### 2.3 หลัง Deploy เสร็จ — Revalidate cache ทั้งหมด

```bash
curl -X POST "https://webuy.in.th/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ค่า_REVALIDATE_SECRET_จาก_Vercel" \
  -d "{\"type\": \"all\"}"
```

ควรได้ `{"success":true,...}`

### 2.4 ลองเปิดเว็บ

- https://webuy.in.th/locations  
- https://webuy.in.th/locations/yala  
- https://webuy.in.th/categories  
- https://webuy.in.th/categories/camera  

ถ้ายัง 404 ให้ลอง incognito หรือ hard refresh (Ctrl+Shift+R)

---

## ส่วนที่ 3: ตรวจใน WordPress

- มี Location pages ที่ **Published** และ slug ตรง (เช่น yala, tak)
- มี Device Categories ที่ slug ตรง (camera, notebook, mobile ฯลฯ)
- field `site` ถ้าไม่มีหรือว่าง โค้ดยอมรับแล้ว (แก้ใน commit ล่าสุด)

---

## สรุปลำดับทำ

| # | ทำบน | ทำอะไร |
|---|------|--------|
| 1 | Server | ปิด healthcheck ใน docker-compose |
| 2 | Server | docker compose down && up -d |
| 3 | Server | crontab รัน wp-cron ทุก 5 นาที |
| 4 | Server | แก้ Nginx (graphql + timeouts) แล้ว reload |
| 5 | Vercel | ตรวจ WEBUY_GQL_SECRET, Redeploy (Clear Cache) |
| 6 | Terminal | POST /api/revalidate กับ type "all" |
| 7 | Browser | ลองเปิด locations, categories (incognito ถ้ายัง 404) |
