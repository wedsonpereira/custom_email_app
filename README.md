# Enquiry Application

Email management system with authentication.

## Quick Start

### Development (localhost)

**Backend:**
```bash
cd backend/emaildataview
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

**Access:** http://localhost:5173  
**Login:** thumbeja / cdn@418766

---

### Production Deployment

**Build Backend:**
```bash
cd backend/emaildataview
./mvnw clean package -DskipTests
```

**Build Frontend:**
```bash
cd Frontend
npm run build
```

**Deploy:**
- Frontend: Upload `Frontend/dist/*` to `public_html/`
- Backend: Upload JAR to `public_html/spring/`
- Start: `java -jar emaildataview-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`

**Access:** https://enquiry.thumbeja.com  
**Login:** thumbeja / cdn@418766

---

## Configuration

### Development (default)
- HTTP (localhost)
- Cookie: secure=false, no domain restriction

### Production (use `-Dspring-boot.run.profiles=prod`)
- HTTPS (enquiry.thumbeja.com)
- Cookie: secure=true, domain=enquiry.thumbeja.com

---

## Troubleshooting

**401 Error after login?**
- Restart backend (it will use development settings by default)
- Clear browser cookies
- Try in incognito mode

**MongoDB connection issues?**
- Check MongoDB Atlas Network Access
- Add your IP to whitelist (or 0.0.0.0/0 for testing)

---

## Endpoints

**Public:**
- `/api/auth/login` - Login
- `/api/auth/status` - Check auth status
- `/api/contact` - Submit contact form
- `/api/test-db` - Test MongoDB connection

**Protected (requires authentication):**
- `/api/emails` - Get all emails
- `/api/contactdelete` - Delete email
- `/api/auth/logout` - Logout
