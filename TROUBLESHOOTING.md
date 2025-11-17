# 🔧 Troubleshooting Guide - Enquiry

## Common Issues and Solutions

### 1. "<!doctype" Error / HTML Instead of JSON

**Symptom:** Getting HTML response instead of JSON from API

**Causes:**
- Session not maintained after login
- Cookie not being sent with requests
- Backend redirecting to login page

**Solutions:**

#### A. Check Session Cookie Settings
In `application-prod.properties`:
```properties
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.path=/
```

#### B. Verify API Endpoints
Make sure you're using the correct endpoint structure:
```javascript
API_ENDPOINTS.EMAILS.LIST  // ✅ Correct
API_ENDPOINTS.EMAILS       // ❌ Wrong
```

#### C. Check Credentials in Fetch
```javascript
fetch(url, {
    credentials: 'include',  // ✅ Required for cookies
})
```

#### D. Restart Backend
```bash
cd ~/public_html/spring
./restart-production.sh
```

---

### 2. Login Works But Data Not Fetching

**Symptom:** Can login but dashboard shows error

**Check:**

1. **Backend is running:**
```bash
./status-production.sh
```

2. **Check logs:**
```bash
tail -f app.log
```

3. **Test API directly:**
```bash
curl -X GET https://enquiry.thumbeja.com/spring/api/emails \
  -H "Cookie: JSESSIONID=your-session-id" \
  -v
```

4. **Verify MongoDB connection:**
- Check MongoDB Atlas dashboard
- Verify IP whitelist includes server IP

---

### 3. CORS Errors

**Symptom:** "Access-Control-Allow-Origin" error in console

**Solution:**

Check `SecurityConfig.java`:
```java
config.setAllowedOriginPatterns(List.of(
    "https://enquiry.thumbeja.com",
    "https://*.thumbeja.com"
));
config.setAllowCredentials(true);
```

Rebuild and redeploy backend.

---

### 4. 401 Unauthorized After Login

**Symptom:** Login succeeds but immediate 401 on next request

**Causes:**
- Cookie domain mismatch
- Cookie not being saved
- Session timeout too short

**Solutions:**

1. **Check browser cookies:**
   - Open DevTools → Application → Cookies
   - Look for `JSESSIONID` cookie
   - Verify domain and path

2. **Update cookie settings:**
```properties
server.servlet.session.cookie.path=/
server.servlet.session.timeout=30m
```

3. **Check same-site policy:**
   - Use `lax` for same-domain
   - Use `none` only if cross-domain (requires secure=true)

---

### 5. Session Expires Too Quickly

**Symptom:** Getting logged out frequently

**Solution:**

Increase session timeout in `application-prod.properties`:
```properties
server.servlet.session.timeout=60m  # 60 minutes
server.servlet.session.cookie.max-age=3600  # 1 hour in seconds
```

---

### 6. Build Errors

#### "terser not found"
```bash
cd Frontend
npm install -D terser
```

#### "API_ENDPOINTS already declared"
Check for duplicate imports:
```javascript
// ❌ Wrong
import API_ENDPOINTS from '../config/api';
import { API_ENDPOINTS } from '../config/api';

// ✅ Correct
import { API_ENDPOINTS } from '../config/api';
```

---

### 7. Backend Won't Start

**Check:**

1. **Java version:**
```bash
java -version  # Should be 21+
```

2. **Port availability:**
```bash
netstat -tuln | grep 8080
```

3. **JAR file exists:**
```bash
ls -lh emaildataview-0.0.1-SNAPSHOT.jar
```

4. **Permissions:**
```bash
chmod +x *.sh
```

5. **Logs:**
```bash
cat app.log
```

---

### 8. Frontend Not Loading

**Check:**

1. **Files uploaded:**
```bash
ls -la ~/public_html/
# Should see: index.html, assets/, enquiry-logo.svg
```

2. **File permissions:**
```bash
chmod 644 ~/public_html/index.html
chmod 755 ~/public_html/assets
```

3. **Browser cache:**
   - Clear cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R)

---

### 9. MongoDB Connection Issues

**Symptom:** "MongoTimeoutException" in logs

**Solutions:**

1. **Check MongoDB Atlas:**
   - Verify cluster is running
   - Check IP whitelist (add 0.0.0.0/0 for testing)
   - Verify credentials

2. **Test connection:**
```bash
# In backend logs, look for:
# "Connected to MongoDB"
```

3. **Update connection string:**
```properties
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net
spring.data.mongodb.database=emailreplies
```

---

### 10. Delete Not Working

**Check:**

1. **API endpoint:**
```javascript
API_ENDPOINTS.EMAILS.DELETE  // ✅ Correct
API_ENDPOINTS.CONTACT.DELETE // ❌ Wrong
```

2. **Request format:**
```javascript
axios.delete(url, {
    data: { email: emailAddress },
    credentials: 'include'
})
```

3. **Backend endpoint:**
```java
@DeleteMapping("/api/contactdelete")
public ResponseEntity<?> deleteContactByEmail(@RequestBody EmailDeleteRequest request)
```

---

## Debug Mode

### Enable Debug Logging

In `application-prod.properties`:
```properties
logging.level.com.emails.emaildataview=DEBUG
logging.level.org.springframework.security=DEBUG
```

Restart backend and check logs.

### Browser Console

Open DevTools (F12) and check:
- **Console tab:** JavaScript errors
- **Network tab:** API calls and responses
- **Application tab:** Cookies and session storage

---

## Quick Fixes

### Complete Reset

```bash
# Backend
cd ~/public_html/spring
./stop-production.sh
rm app.log app.pid
./start-production.sh

# Frontend
# Clear browser cache
# Hard refresh (Ctrl+Shift+R)
```

### Verify Everything

```bash
# 1. Backend running
./status-production.sh

# 2. Test login
curl -X POST https://enquiry.thumbeja.com/spring/api/auth/login \
  -d "username=thumbeja&password=cdn@418766" \
  -c cookies.txt

# 3. Test emails endpoint
curl -X GET https://enquiry.thumbeja.com/spring/api/emails \
  -b cookies.txt

# 4. Check frontend
curl -I https://enquiry.thumbeja.com/
```

---

## Still Having Issues?

1. Check all logs:
   - Backend: `~/public_html/spring/app.log`
   - Browser: DevTools Console
   - MongoDB: Atlas dashboard

2. Verify configuration:
   - `application-prod.properties`
   - `SecurityConfig.java`
   - `config/api.js`

3. Test step by step:
   - Can you access frontend?
   - Can you login?
   - Can you see cookies?
   - Can you call API directly?

4. Compare with working local setup

---

**Last Updated:** 2025
