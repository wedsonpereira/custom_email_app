# Deployment Guide for enquiry.thumbeja.com

## Project Structure on Server
```
enquiry.thumbeja.com/
├── (Frontend files - root directory)
│   ├── index.html
│   ├── assets/
│   └── .htaccess
└── spring/
    └── (Backend Spring Boot application)
```

## Frontend Deployment

### 1. Build the Frontend
```bash
cd Frontend
npm install
npm run build
```

This creates a `dist` folder with optimized production files.

### 2. Upload Frontend Files
Upload all files from `Frontend/dist/` to your domain root:
- `enquiry.thumbeja.com/index.html`
- `enquiry.thumbeja.com/assets/`
- `enquiry.thumbeja.com/.htaccess` (for React Router)

### 3. Environment Configuration
The app automatically uses:
- **Development**: `http://localhost:8080` (when running `npm run dev`)
- **Production**: `https://enquiry.thumbeja.com/spring` (when built)

## Backend Deployment

### 1. Backend Location
Place your Spring Boot application in:
```
enquiry.thumbeja.com/spring/
```

### 2. Spring Boot Configuration
Update your `application.properties` or `application.yml`:

```properties
# Server configuration
server.port=8080
server.servlet.context-path=/spring

# CORS configuration
cors.allowed-origins=https://enquiry.thumbeja.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true

# Session configuration
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.path=/
```

### 3. CORS Configuration (Spring Security)
Ensure your Spring Security config allows CORS:

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("https://enquiry.thumbeja.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## API Endpoints

The frontend expects these endpoints:

- `POST /spring/api/auth/login` - User login
- `POST /spring/api/auth/logout` - User logout
- `GET /spring/api/auth/status` - Check auth status
- `GET /spring/api/emails` - Get all email submissions
- `DELETE /spring/api/contactdelete` - Delete email submission

## SSL/HTTPS Configuration

Ensure your server has SSL certificate installed for:
- `https://enquiry.thumbeja.com`

## Testing Production Build Locally

Before deploying, test the production build:

```bash
cd Frontend
npm run build
npm run preview
```

This serves the production build at `http://localhost:4173`

## Troubleshooting

### CORS Issues
- Verify backend CORS configuration allows `https://enquiry.thumbeja.com`
- Check that credentials are enabled in CORS config
- Ensure cookies are set with correct domain and path

### 404 Errors on Refresh
- Ensure `.htaccess` is uploaded and mod_rewrite is enabled
- For nginx, use appropriate rewrite rules

### API Connection Issues
- Verify backend is running at `/spring` path
- Check firewall rules allow connections
- Verify SSL certificates are valid

### Session/Cookie Issues
- Ensure cookies are set with `SameSite=Lax` or `None` with `Secure=true`
- Check cookie domain matches your domain
- Verify `withCredentials: true` in all fetch calls

## Quick Deploy Script

```bash
#!/bin/bash
# Build frontend
cd Frontend
npm install
npm run build

# The dist folder is ready to upload to enquiry.thumbeja.com/
echo "Frontend built successfully!"
echo "Upload contents of Frontend/dist/ to your server root"
echo "Upload backend to enquiry.thumbeja.com/spring/"
```

## Post-Deployment Checklist

- [ ] Frontend files uploaded to domain root
- [ ] Backend deployed to `/spring` directory
- [ ] SSL certificate active
- [ ] CORS configured correctly
- [ ] Test login functionality
- [ ] Test email list loading
- [ ] Test delete functionality
- [ ] Test logout
- [ ] Verify all routes work (refresh on any page)
- [ ] Check browser console for errors
- [ ] Test on mobile devices
