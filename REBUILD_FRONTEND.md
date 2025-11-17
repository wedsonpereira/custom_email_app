# 🔄 Rebuild Frontend After URL Fix

## What Was Wrong:
You hardcoded the URL in `api.js` to `https://enquiry.thumbeja.com` (missing `/spring`)

## What I Fixed:
1. Changed `api.js` back to use environment variables:
   - Development: `http://localhost:8080`
   - Production: `https://enquiry.thumbeja.com/spring`

2. Moved `.htaccess` to `public/` folder so it's automatically included in builds

## What You Need to Do:

### 1. Frontend is Already Built! ✅
The build is complete with the correct configuration.

### 2. Upload to Server:
Upload ALL files from `Frontend/dist/` to `public_html/`

Files to upload:
- ✅ index.html
- ✅ .htaccess (now included automatically)
- ✅ assets/ folder
- ✅ enquiry-logo.svg
- ✅ vite.svg
- ✅ _redirects

### 3. Clear Browser Cache:
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Or open in incognito/private mode

### 4. Test:
- Visit: https://enquiry.thumbeja.com
- Login: thumbeja / cdn@418766
- Should work now!

---

## Why This Matters:

The environment variable approach allows:
- **Development:** Uses `http://localhost:8080` automatically
- **Production:** Uses `https://enquiry.thumbeja.com/spring` automatically

No need to change code when switching between dev and production!

---

## If Still Getting 401:

Check backend is running with production profile:
```bash
ps aux | grep emaildataview
```

Should show: `--spring.profiles.active=prod`

If not, restart backend:
```bash
cd /home/enquiry/public_html/spring
pkill -f emaildataview
nohup java -jar emaildataview-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod > app.log 2>&1 &
```
