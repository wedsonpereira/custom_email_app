# 🚀 Final Production Setup (No Proxy)

## What Changed:

Since Apache proxy was causing issues, we're using a simpler approach:
- Frontend connects directly to backend on port 8080
- No proxy configuration needed
- Simpler `.htaccess` (just for React Router)

---

## Server Configuration Needed:

### 1. Open Port 8080 in Firewall

Your backend needs to be accessible on port 8080 from the internet.

**For cPanel/WHM:**
- Go to Security → Firewall
- Add port 8080 to allowed ports

**For UFW (Ubuntu):**
```bash
sudo ufw allow 8080
sudo ufw reload
```

**For firewalld (CentOS/RHEL):**
```bash
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### 2. Configure Backend to Listen on All Interfaces

Make sure backend is accessible from outside (not just localhost).

Check `application-prod.properties` has:
```properties
server.port=8080
server.address=0.0.0.0
```

If not, add `server.address=0.0.0.0` to the file.

### 3. Restart Backend

```bash
cd /home/enquiry/public_html/spring
pkill -f emaildataview
nohup java -jar emaildataview-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod > app.log 2>&1 &
```

---

## Upload Files:

### Upload to `public_html/`:
- All files from `Frontend/dist/`
- Including the new `.htaccess` (simplified version)

---

## Test:

### 1. Test backend is accessible:
```bash
curl https://enquiry.thumbeja.com:8080/api/auth/status
```

Should return: `{"authenticated":false}`

### 2. Test from browser:
Visit: `https://enquiry.thumbeja.com`

### 3. Login:
- Username: thumbeja
- Password: cdn@418766

---

## If Port 8080 Can't Be Opened:

If your hosting doesn't allow opening port 8080, you have two options:

### Option A: Use a Different Port (like 443 or 8443)

Update backend to use port 443 or 8443 (often allowed):
```properties
server.port=8443
```

Then update frontend:
```
VITE_API_BASE_URL=https://enquiry.thumbeja.com:8443
```

### Option B: Contact Hosting Support

Ask them to:
1. Enable mod_proxy and mod_proxy_http
2. Or help configure the proxy

---

## Current Configuration:

**Frontend:**
- URL: https://enquiry.thumbeja.com
- API: https://enquiry.thumbeja.com:8080

**Backend:**
- Port: 8080
- Address: 0.0.0.0 (all interfaces)
- Profile: prod

**Files Built:**
- ✅ Frontend with correct API URL
- ✅ Simplified .htaccess (no proxy)
- ✅ Ready to upload

---

## Summary:

1. ✅ Frontend built with correct configuration
2. ⏳ Open port 8080 on server
3. ⏳ Upload dist/ files to public_html/
4. ⏳ Restart backend with prod profile
5. ⏳ Test and login

The main thing you need to do on the server is **open port 8080** in the firewall!
