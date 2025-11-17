# 🔧 Alternative Solution: Backend on Subdomain

## The Problem:
Port 8080 is blocked by your hosting/firewall, so frontend can't connect to backend.

## Best Solution: Use a Subdomain

Instead of trying to open port 8080, use a subdomain that points to your backend.

---

## Option 1: Subdomain (Recommended)

### Setup:

1. **Create subdomain in cPanel:**
   - Subdomain: `api.enquiry.thumbeja.com`
   - Document Root: `/home/enquiry/public_html/api`

2. **Create proxy in subdomain's .htaccess:**

Create `/home/enquiry/public_html/api/.htaccess`:
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:8080/$1 [P,L]
```

3. **Update frontend .env.production:**
```
VITE_API_BASE_URL=https://api.enquiry.thumbeja.com
```

4. **Rebuild frontend:**
```bash
cd Frontend
npm run build
```

5. **Upload and test**

---

## Option 2: Use Main Domain with /api Path

### Setup:

1. **Update main .htaccess** (`/home/enquiry/public_html/.htaccess`):

Add BEFORE the React Router rules:
```apache
RewriteEngine On

# Proxy /api requests to backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:8080/api/$1 [P,L]

# React Router (existing rules)
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

2. **Update frontend .env.production:**
```
VITE_API_BASE_URL=https://enquiry.thumbeja.com
```

3. **Rebuild frontend:**
```bash
cd Frontend
npm run build
```

---

## Option 3: Run Backend on Different Port

Some ports are usually open:
- 443 (HTTPS)
- 8443 (Alternative HTTPS)
- 3000
- 5000

### Try port 8443:

1. **Update application-prod.properties:**
```properties
server.port=8443
server.address=0.0.0.0
```

2. **Update frontend .env.production:**
```
VITE_API_BASE_URL=https://enquiry.thumbeja.com:8443
```

3. **Rebuild both:**
```bash
# Backend
cd backend/emaildataview
./mvnw clean package -DskipTests

# Frontend
cd Frontend
npm run build
```

---

## Option 4: Contact Hosting Support

Ask them to:
1. Enable mod_proxy and mod_proxy_http
2. Or open port 8080
3. Or help configure reverse proxy

---

## Quick Test: Which Ports Are Open?

From your local machine, test which ports are accessible:

```bash
# Test different ports
curl https://enquiry.thumbeja.com:8080/api/auth/status
curl https://enquiry.thumbeja.com:8443/api/auth/status
curl https://enquiry.thumbeja.com:3000/api/auth/status
```

If any of these work, use that port!

---

## My Recommendation:

**Use Option 1 (Subdomain)** - It's the cleanest and most professional:
- Frontend: https://enquiry.thumbeja.com
- Backend: https://api.enquiry.thumbeja.com

This way:
- No port numbers in URLs
- Clean separation
- Easy to manage
- Works with any hosting

---

## Current Status:

- ✅ Code is correct
- ✅ Backend works on localhost
- ❌ Port 8080 is blocked from outside
- 🔧 Need to use subdomain or different port

Let me know which option you want to try, and I'll help you set it up!
