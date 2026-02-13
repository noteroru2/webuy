# WordPress Permalink Fix

## Problem
WordPress GraphQL queries by slug return 404 because permalinks are not configured.

## Solution

### Via WordPress Admin (Recommended)
1. Go to https://cms.webuy.in.th/wp-admin
2. Navigate to **Settings → Permalinks**
3. Select **"Post name"** option
4. Click **"Save Changes"**

### Via SSH (Alternative)
If you have SSH access to your Hetzner VPS:

```bash
# Enter WordPress container
docker exec -it webuy-wordpress bash

# Run WP-CLI command to set permalinks
wp rewrite structure '/%postname%/' --allow-root

# Flush rewrite rules
wp rewrite flush --allow-root

# Exit container
exit
```

### Via MySQL (Last Resort)
```bash
# Enter MySQL container
docker exec -it webuy-mysql mysql -u wordpress -pwordpress_password wordpress

# Update permalink structure
UPDATE wp_options SET option_value = '/%postname%/' WHERE option_name = 'permalink_structure';

# Exit MySQL
exit
```

## Verify
After changing permalinks, test GraphQL queries:

```
https://cms.webuy.in.th/graphql
```

Query:
```graphql
{
  service(id: "รับซื้อ-iphone", idType: SLUG) {
    id
    title
    slug
  }
  locationpage(id: "รับซื้อมือถือ-กรุงเทพ", idType: SLUG) {
    id
    title
    slug
    province
  }
  pricemodel(id: "ราคา-iphone-15-pro", idType: SLUG) {
    id
    title
    slug
    device
  }
}
```

Should return data (not null).

## After Fix
Redeploy Vercel:
```bash
git commit --allow-empty -m "Trigger rebuild after WordPress permalink fix"
git push origin main
```

Or manually redeploy in Vercel Dashboard.
