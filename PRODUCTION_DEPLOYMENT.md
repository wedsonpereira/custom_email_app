# 🚀 Production Deployment Guide

## ✅ What Was Fixed:

1. **Development vs Production Separation**
   - Default: Development settings (HTTP, localhost)
   - Production: Use `--spring.profiles.active=prod` flag

2. **Cookie Configuration**
   - Development: secure=false, no domain
   - Production: secure=true, domain=enquiry.thumbeja.com

3. **Authentication**
   - Protected endpoints require login
   - Session-based authentication with HttpOnly cookies

---

## 📦 Build for Production

### 1. Build Backend
```bash
cd backend/emaildataview
./mvnw clean package -DskipTests
```
Output: `target/emaildataview-0.0.1-SNAPSHOT.jar`

### 2. Build Frontend
```bash
cd Frontend
npm run build
```
Output: `dist/` folder

---

## 🌐 Deploy to Server

### Upload Files:

**Frontend (to `public_html/`):**
- All files from `Frontend/dist/`
- Including `.htaccess`

**Backend (to `public_html/spring/`):**
- `emaildataview-0.0.1-SNAPSHOT.jar`
- `start-production.sh` (from backend/emaildataview/)
- `stop-production.sh` (from backend/emaildataview/)

---

## ▶️ Start Backend in Production

**IMPORTANT:** Use the production profile!

```bash
cd public_html/spring
java -jar emaildataview-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Or use the startup script:
```bash
./start-production.sh
```

**Note:** Make sure to add `--spring.profiles.active=prod` to the startup script!

---

## ✅ Production Checklist

Before deploying, verify:

### Backend:
- [ ] JAR file built successfully
- [ ] MongoDB Atlas allows server IP (Network Access)
- [ ] Port 8080 is available
- [ ] Java 21 is installed on server

### Frontend:
- [ ] Build completed without errors
- [ ] `.htaccess` is included in dist/
- [ ] `.env.production` has correct API URL

### Server:
- [ ] HTTPS/SSL certificate is active
- [ ] Domain points to server
- [ ] Apache proxy modules enabled (mod_proxy, mod_proxy_http)

---

## 🧪 Test Production Deployment

### 1. Test Backend Directly
```bash
curl https://enquiry.thumbeja.com/spring/api/auth/status
```
Expected: `{"authenticated":false}`

### 2. Test Frontend
Visit: `https://enquiry.thumbeja.com`
Should see login page

### 3. Test Login
- Username: `thumbeja`
- Password: `cdn@418766`
- Should redirect to dashboard
- Should see emails

### 4. Test Session Persistence
- Refresh page
- Should stay logged in
- Should still see emails

### 5. Test Logout
- Click logout
- Should redirect to login
- Try accessing dashboard directly
- Should redirect back to login

---

## 🔍 Troubleshooting Production

### Issue: 401 Error After Login

**Check:**
1. Backend is running with `--spring.profiles.active=prod`
2. HTTPS is working (not HTTP)
3. Cookie domain matches (enquiry.thumbeja.com)

**Verify cookie in browser:**
- DevTools → Application → Cookies
- Should see JSESSIONID with:
  - Secure: ✓
  - Domain: enquiry.thumbeja.com
  - SameSite: None

### Issue: Can't Access Backend API

**Check:**
1. Backend is running: `ps aux | grep emaildataview`
2. Port 8080 is listening: `netstat -tuln | grep 8080`
3. Apache proxy is working
4. Check Apache error logs

### Issue: CORS Errors

**Verify SecurityConfig allows:**
```java
config.setAllowedOriginPatterns(List.of(
    "https://enquiry.thumbeja.com",
    "http://localhost:5173"
));
```

---

## 🔄 Update Production

### Update Backend:
```bash
# Build new JAR
cd backend/emaildataview
./mvnw clean package -DskipTests

# Upload to server
# Then on server:
cd public_html/spring
./stop-production.sh
# Replace JAR file
java -jar emaildataview-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod &
```

### Update Frontend:
```bash
# Build
cd Frontend
npm run build

# Upload dist/* to public_html/
```

---

## ⚠️ Critical Production Settings

### Backend Must Use:
```bash
--spring.profiles.active=prod
```

This ensures:
- Cookie secure=true (HTTPS only)
- Cookie domain=enquiry.thumbeja.com
- SameSite=none (cross-origin)

### Without Production Profile:
- Will use development settings
- Cookies won't work on HTTPS
- Authentication will fail

---

## 📝 Production Startup Script

Update `start-production.sh` to include production profile:

```bash
#!/bin/bash
echo "🚀 Starting Enquiry Backend (Production)..."

JAR_FILE="emaildataview-0.0.1-SNAPSHOT.jar"

if [ ! -f "$JAR_FILE" ]; then
    echo "❌ Error: $JAR_FILE not found!"
    exit 1
fi

# IMPORTANT: Use production profile
nohup java -jar $JAR_FILE --spring.profiles.active=prod > app.log 2>&1 &

echo $! > app.pid
echo "✅ Application started with PID: $(cat app.pid)"
echo "📋 Log file: app.log"
```

---

## 🎯 Summary

**Development (localhost):**
```bash
./mvnw spring-boot:run
# Uses default profile (development settings)
```

**Production (server):**
```bash
java -jar emaildataview-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
# Uses production profile (HTTPS settings)
```

**Key Difference:**
- Development: HTTP, no domain restriction
- Production: HTTPS, domain=enquiry.thumbeja.com

Both configurations are tested and working!
