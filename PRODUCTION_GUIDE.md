# Enquiry - Production Deployment Guide

## 📋 Prerequisites

- Node.js 18+ and npm
- Java 21+
- Maven
- MongoDB Atlas account
- cPanel/SSH access to server

---

## 🔧 Backend Deployment

### 1. Build the JAR file

```bash
cd backend/emaildataview
mvn clean package -DskipTests
```

The JAR will be created at: `target/emaildataview-0.0.1-SNAPSHOT.jar`

### 2. Upload to Server

Upload these files to `public_html/spring/`:
- `emaildataview-0.0.1-SNAPSHOT.jar`
- `start-production.sh`
- `stop-production.sh`
- `restart-production.sh`
- `status-production.sh`

### 3. Make Scripts Executable

```bash
chmod +x *.sh
```

### 4. Start the Application

```bash
./start-production.sh
```

### 5. Verify Backend is Running

```bash
./status-production.sh
```

Or check the logs:
```bash
tail -f app.log
```

### Backend URLs:
- Login: `https://enquiry.thumbeja.com/spring/api/auth/login`
- Emails: `https://enquiry.thumbeja.com/spring/api/emails`
- Contact: `https://enquiry.thumbeja.com/spring/api/contact`

---

## 🎨 Frontend Deployment

### 1. Build for Production

```bash
cd Frontend
npm install
npm run build:prod
```

This creates optimized files in `Frontend/dist/`

### 2. Upload to Server

Upload all files from `Frontend/dist/` to `public_html/`:
- `index.html`
- `assets/` folder
- `enquiry-logo.svg`
- `.htaccess` (if exists)

### 3. Verify Frontend

Visit: `https://enquiry.thumbeja.com/`

---

## 🔐 Security Checklist

### Backend:
- ✅ HTTPS enabled (cookie.secure=true)
- ✅ BCrypt password hashing
- ✅ Session timeout: 30 minutes
- ✅ HTTP-only cookies
- ✅ CORS restricted to thumbeja.com
- ✅ Console logs removed in production
- ✅ Stack traces hidden

### Frontend:
- ✅ Environment-based API URLs
- ✅ Console logs removed (drop_console: true)
- ✅ Minified and optimized
- ✅ Code splitting for faster loads
- ✅ Proper authentication validation

---

## 📊 Monitoring

### Check Backend Status:
```bash
cd ~/public_html/spring
./status-production.sh
```

### View Logs:
```bash
tail -f ~/public_html/spring/app.log
```

### Restart if Needed:
```bash
./restart-production.sh
```

---

## 🔄 Update Deployment

### Backend Update:
```bash
# 1. Build new JAR
cd backend/emaildataview
mvn clean package -DskipTests

# 2. Upload new JAR to server

# 3. Restart
cd ~/public_html/spring
./restart-production.sh
```

### Frontend Update:
```bash
# 1. Build
cd Frontend
npm run build:prod

# 2. Upload dist/ contents to public_html/

# 3. Clear browser cache or use Ctrl+Shift+R
```

---

## 🐛 Troubleshooting

### Backend Not Starting:
1. Check if port 8080 is available
2. Check Java version: `java -version`
3. Check logs: `cat app.log`
4. Verify MongoDB connection

### Login Not Working:
1. Check CORS settings in SecurityConfig
2. Verify cookie settings (secure, same-site)
3. Check browser console for errors
4. Verify backend is running: `./status-production.sh`

### 401 Unauthorized:
1. Clear browser cookies
2. Check session timeout (30 min)
3. Verify credentials in SecurityConfig
4. Check backend logs

---

## 📝 Default Credentials

**Username:** `thumbeja`  
**Password:** `cdn@418766`

⚠️ **Change these in production!** Update in:
`backend/emaildataview/src/main/java/com/emails/emaildataview/Security/SecurityConfig.java`

---

## 🎯 Performance Optimization

### Backend:
- Compression enabled
- Connection pooling
- Session management optimized
- Log rotation (30 days, 10MB max)

### Frontend:
- Code splitting (vendor, icons, utils)
- Terser minification
- Asset hashing for cache busting
- Lazy loading components

---

## 📞 Support

For issues, check:
1. Backend logs: `~/public_html/spring/app.log`
2. Browser console (F12)
3. Network tab for API calls
4. MongoDB Atlas logs

---

## ✅ Production Checklist

Before going live:

- [ ] Backend JAR uploaded and running
- [ ] Frontend built and uploaded
- [ ] HTTPS working correctly
- [ ] Login functionality tested
- [ ] Email list loading correctly
- [ ] Delete functionality working
- [ ] Export CSV working
- [ ] Statistics dashboard showing data
- [ ] Mobile responsive tested
- [ ] Browser compatibility checked
- [ ] Backup strategy in place
- [ ] Monitoring set up

---

**Last Updated:** 2025
**Version:** 1.0.0
