# 🔄 WordPress Multisite → Single Site Migration Guide

## สถานการณ์
- **เดิม:** WordPress Multisite Network (Hostatomwp)
- **ใหม่:** WordPress Single Site (Hetzner VPS)
- **ปัญหา:** All-in-One WP Migration ไม่รองรับ Multisite

---

## 🎯 วิธีแก้: 3 ตัวเลือก

---

### **✅ ตัวเลือก 1: Manual Migration (ฟรี, แนะนำ)**

#### **A. Export Database จาก Hostatomwp**

**1. เข้า phpMyAdmin:**
```
URL: https://hostatomwp.com/cpanel (หรือ control panel ของคุณ)
→ Databases → phpMyAdmin
```

**2. เลือก Database ของ WordPress**
- ดู database name ใน `wp-config.php`

**3. Export Database:**
```
Tab: Export
Format: SQL
Compression: gzip
→ คลิก "Go"
→ Download ไฟล์ .sql.gz
```

---

#### **B. Export Files จาก Hostatomwp**

**ใช้ FTP/SFTP Client (เช่น FileZilla, WinSCP):**

**Connect to Hostatomwp:**
```
Host:     ftp.your-domain.com (ดูใน hosting control panel)
Username: your-ftp-username
Password: your-ftp-password
Port:     21 (FTP) หรือ 22 (SFTP)
```

**Download folders เหล่านี้:**
```
/public_html/wp-content/uploads/    → ไฟล์รูป/media ทั้งหมด
/public_html/wp-content/plugins/    → plugins ที่ติดตั้งเอง (ไม่จำเป็น)
/public_html/wp-content/themes/     → themes ที่ติดตั้งเอง (ไม่จำเป็น)
```

**สำคัญที่สุด:** `/wp-content/uploads/` (รูปภาพ, media files)

---

#### **C. Import Database ใน WordPress ใหม่ (Hetzner)**

**1. เข้า phpMyAdmin ของ Hetzner:**

```bash
# ติดตั้ง phpMyAdmin ผ่าน Docker (optional)
cd /opt/wordpress
cat > docker-compose.yml << 'EOF'
# ... (เพิ่ม phpmyadmin service)
EOF
```

**หรือใช้ command line:**

```bash
# 1. Copy ไฟล์ .sql.gz เข้า VPS
# (ใช้ WinSCP หรือ scp command)

# 2. Import database
cd /opt/wordpress
docker exec -i webuy-mysql mysql -uwordpress -pwordpress_password wordpress < backup.sql
```

---

#### **D. Search-Replace URLs ใน Database**

**ปัญหา:** URLs ใน database ยังเป็น `https://cms.webuy.in.th/webuy/` (Multisite URL)

**วิธีแก้:**

**ติดตั้ง WP-CLI ใน container:**

```bash
# เข้า WordPress container
docker exec -it webuy-wordpress bash

# ติดตั้ง WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# Search-Replace URLs
wp search-replace \
  'https://cms.webuy.in.th/webuy' \
  'https://cms.webuy.in.th' \
  --all-tables \
  --allow-root

# ออกจาก container
exit
```

---

#### **E. Upload Files (wp-content/uploads/)**

**ใช้ WinSCP หรือ scp:**

```bash
# ตัวอย่าง: ถ้าใช้ scp จาก local machine
scp -r C:\path\to\uploads\ root@YOUR-HETZNER-IP:/opt/wordpress/uploads/

# ย้ายไฟล์เข้า WordPress container
docker cp /opt/wordpress/uploads/. webuy-wordpress:/var/www/html/wp-content/uploads/

# Set permissions
docker exec webuy-wordpress chown -R www-data:www-data /var/www/html/wp-content/uploads
```

---

### **❌ ตัวเลือก 2: Duplicator Pro (Paid - $69/year)**

**รองรับ Multisite Export:**
```
Plugin: Duplicator Pro
URL: https://duplicator.com/
ราคา: $69/year

ขั้นตอน:
1. ติดตั้ง Duplicator Pro ใน Hostatomwp
2. Export Multisite → Single Site
3. Import ใน Hetzner
```

**ข้อดี:** ทำอัตโนมัติทั้งหมด
**ข้อเสีย:** เสียเงิน

---

### **💡 ตัวเลือก 3: Export เฉพาะข้อมูล → Import ใหม่ (แนะนำถ้าข้อมูลไม่เยอะ)**

**ถ้าข้อมูลไม่เยอะมาก:**

**1. Export Content จาก WordPress เดิม:**
```
Tools → Export
Content Type: All content (Posts, Pages, Custom Post Types)
→ Download .xml file
```

**2. Import ใน WordPress ใหม่:**
```
Tools → Import → WordPress Importer
→ Upload .xml file
→ Assign authors
```

**3. Re-configure Custom Post Types (Pods):**
```
Pods Admin → Migrate Pods (แก้ manual)
```

**4. Upload รูปภาพ:**
```
ใช้ FTP upload wp-content/uploads/
```

**ข้อดี:**
- ✅ ง่ายกว่า manual database migration
- ✅ ได้ข้อมูลสะอาด (ไม่มี junk data)

**ข้อเสีย:**
- ❌ ต้อง re-configure Pods/Custom Fields
- ❌ Settings/Plugins ต้องตั้งค่าใหม่

---

## 🎯 ผมแนะนำ: ตัวเลือก 3 (Export Content → Import)

**เหมาะกับกรณีคุณ เพราะ:**
1. ✅ ข้อมูลหลักคือ: LocationPages, Services, PriceModels, Categories
2. ✅ ใช้ Pods (Custom Post Types) → ตั้งค่าใหม่ง่าย
3. ✅ ได้ WordPress ใหม่สะอาด ไม่มี junk data จาก Multisite
4. ✅ ประมาณ 1-2 ชั่วโมงเสร็จ (ถ้าข้อมูลไม่เกิน 100 posts)

---

## 📋 ขั้นตอนแนะนำ (ตัวเลือก 3)

### **STEP 1: Export Content จาก Hostatomwp**

1. เข้า WordPress Admin: `https://cms.webuy.in.th/webuy/wp-admin`
2. ไปที่ **Tools → Export**
3. เลือก **All content**
4. คลิก **Download Export File** → ได้ไฟล์ `.xml`

---

### **STEP 2: Download รูปภาพทั้งหมด**

**ใช้ FTP/SFTP:**
```
Download: /public_html/wp-content/uploads/
→ เก็บไว้ local machine
```

---

### **STEP 3: Setup WordPress ใหม่ (Hetzner)**

**(เสร็จแล้วจาก docker compose up -d)**

1. เข้า `https://cms.webuy.in.th` → Complete setup wizard
2. ติดตั้ง plugins:
   - ✅ WPGraphQL
   - ✅ Pods
   - ✅ WordPress Importer

---

### **STEP 4: Import Content**

1. **Tools → Import → WordPress**
2. Install "WordPress Importer" plugin
3. Upload ไฟล์ `.xml` ที่ export มา
4. **Import Attachments:** ✓ Check
5. Assign Authors → Run Importer

**⚠️ รูปภาพจะ import ไม่สำเร็จ (ปกติ)** → ต้อง upload manual

---

### **STEP 5: Upload รูปภาพ**

**ใช้ WinSCP/scp:**

```bash
# 1. Upload จาก local → VPS
scp -r C:\path\to\uploads\ root@YOUR-HETZNER-IP:/tmp/wp-uploads/

# 2. Copy เข้า WordPress container
docker cp /tmp/wp-uploads/. webuy-wordpress:/var/www/html/wp-content/uploads/

# 3. Set permissions
docker exec webuy-wordpress chown -R www-data:www-data /var/www/html/wp-content/uploads
```

---

### **STEP 6: Re-configure Pods**

**ตั้งค่า Custom Post Types ใหม่:**

1. **Pods Admin → Add New Pod**

**LocationPages:**
```
Pod Type: Custom Post Type
Post Type Name: locationpage
Label: Location Pages
```

**Custom Fields:**
```
- province (Plain Text)
- district (Plain Text)
- content (WYSIWYG)
```

**Services, PriceModels, DeviceCategories:** ทำแบบเดียวกัน

---

### **STEP 7: Test GraphQL**

```bash
curl -X POST https://cms.webuy.in.th/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ locationPages(first: 5) { nodes { slug title province district } } }"
  }'
```

**ถ้าได้ข้อมูล → สำเร็จ!**

---

## 📞 คุณต้องการวิธีไหน?

**1. Manual Migration (ยาก แต่ได้ข้อมูลครบ 100%)**
   - Export Database + Files
   - Search-Replace URLs
   - Import ทั้งหมด
   - ⏱️ ~3-4 ชั่วโมง

**2. Export Content → Import (ง่าย แนะนำ)**
   - Export .xml
   - Import ใน WordPress ใหม่
   - Re-configure Pods
   - Upload รูปภาพ manual
   - ⏱️ ~1-2 ชั่วโมง

**3. Duplicator Pro (ง่ายที่สุด แต่เสียเงิน $69)**

---

**บอกผมครับว่าอยากทำแบบไหน แล้วผมจะ guide ทีละ step!** 💪
