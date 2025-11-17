# 🌐 External Website Integration Guide

## Sending Contact Form Data from thumbeja.com to Enquiry

Your main website (`https://thumbeja.com`) can send contact form submissions to the Enquiry backend.

---

## ✅ Backend Configuration (Already Done)

### 1. CORS Enabled
```java
// SecurityConfig.java
config.setAllowedOriginPatterns(List.of(
    "https://thumbeja.com",
    "https://*.thumbeja.com"
));
```

### 2. Public Endpoint
```java
.requestMatchers("/api/contact").permitAll()
```

---

## 📝 Frontend Implementation (Your Website)

### Complete Example

```javascript
const onSubmit = async (event) => {
    event.preventDefault();
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        
        // Convert to JSON
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            business: formData.get('business') || '',
            contact: formData.get('contact') || formData.get('phone') || '',
            message: formData.get('message')
        };
        
        // Validate required fields
        if (!data.name || !data.email || !data.message) {
            throw new Error('Please fill in all required fields');
        }
        
        // Send to API
        const response = await axios.post(
            "https://enquiry.thumbeja.com/spring/api/contact", 
            data, 
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: false  // Important: No credentials for public endpoint
            }
        );
         
        if (response.status === 201 || response.status === 200) {
            // Success
            toast.success("Thank you! Your message has been sent successfully.");
            event.target.reset();
        }
        
    } catch (err) {
        console.error("Error details:", err);
        
        // User-friendly error messages
        let errorMessage = "Failed to send message. Please try again.";
        
        if (err.response) {
            // Server responded with error
            errorMessage = err.response.data?.message || 
                          `Server error: ${err.response.status}`;
        } else if (err.request) {
            // Request made but no response
            errorMessage = "Unable to reach server. Please check your connection.";
        } else {
            // Error in request setup
            errorMessage = err.message;
        }
        
        toast.error(errorMessage);
        
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
};
```

---

## 📋 Required Form Fields

Your HTML form should have these fields with matching `name` attributes:

```html
<form onsubmit="onSubmit(event)">
    <!-- Required -->
    <input type="text" name="name" required placeholder="Your Name" />
    <input type="email" name="email" required placeholder="Your Email" />
    <textarea name="message" required placeholder="Your Message"></textarea>
    
    <!-- Optional -->
    <input type="text" name="business" placeholder="Business Name" />
    <input type="tel" name="contact" placeholder="Phone Number" />
    
    <button type="submit">Send Message</button>
</form>
```

---

## 🔍 Data Format

The API expects JSON in this format:

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "business": "Acme Corp",
    "contact": "+1234567890",
    "message": "I'm interested in your services"
}
```

**Required fields:**
- `name` (string)
- `email` (string)
- `message` (string)

**Optional fields:**
- `business` (string)
- `contact` (string)

---

## ✅ Testing

### 1. Test with cURL

```bash
curl -X POST https://enquiry.thumbeja.com/spring/api/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://thumbeja.com" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "business": "Test Business",
    "contact": "+1234567890",
    "message": "This is a test message"
  }'
```

**Expected Response:**
```json
{
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "business": "Test Business",
    "contact": "+1234567890",
    "message": "This is a test message",
    "date": "2025-01-17",
    "time": "14:30:45"
}
```

### 2. Test in Browser Console

On your website (`https://thumbeja.com`), open console and run:

```javascript
fetch('https://enquiry.thumbeja.com/spring/api/contact', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
    })
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

---

## 🐛 Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Cause:** Origin not in CORS whitelist

**Fix:** Verify backend has your domain:
```java
config.setAllowedOriginPatterns(List.of(
    "https://thumbeja.com",
    "https://www.thumbeja.com"  // Add www if needed
));
```

### Error: "Network Error" or "Failed to fetch"

**Causes:**
1. Backend not running
2. Wrong URL
3. Firewall blocking

**Fix:**
```bash
# Check backend status
cd ~/public_html/spring
./status-production.sh

# Check logs
tail -f app.log
```

### Error: 401 Unauthorized

**Cause:** Sending credentials when not needed

**Fix:** Add `withCredentials: false` to axios config

### Error: 400 Bad Request

**Cause:** Invalid data format

**Fix:** Ensure you're sending valid JSON with required fields

---

## 🔒 Security Considerations

### 1. Rate Limiting (Recommended)

Add rate limiting to prevent spam:

```java
// In EmailController.java
private final Map<String, Long> rateLimitMap = new ConcurrentHashMap<>();

@PostMapping("/api/contact")
public ResponseEntity<Client> submitContacts(@RequestBody Client client, HttpServletRequest request) {
    String ip = request.getRemoteAddr();
    Long lastRequest = rateLimitMap.get(ip);
    
    if (lastRequest != null && System.currentTimeMillis() - lastRequest < 60000) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
    }
    
    rateLimitMap.put(ip, System.currentTimeMillis());
    
    // ... rest of code
}
```

### 2. Input Validation

Add validation in backend:

```java
if (client.getName() == null || client.getName().trim().isEmpty()) {
    return ResponseEntity.badRequest().body(null);
}

if (client.getEmail() == null || !client.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
    return ResponseEntity.badRequest().body(null);
}
```

### 3. Honeypot Field

Add hidden field to catch bots:

```html
<!-- In your form -->
<input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />
```

```javascript
// In your submit handler
const honeypot = formData.get('website');
if (honeypot) {
    // Bot detected, silently fail
    return;
}
```

---

## 📊 Monitoring

### Check Submissions

Login to Enquiry dashboard:
- URL: `https://enquiry.thumbeja.com/`
- View all submissions in real-time
- Export to CSV
- View statistics

### Backend Logs

```bash
cd ~/public_html/spring
tail -f app.log | grep "Contact Form Submission"
```

---

## 🚀 Production Checklist

Before going live:

- [ ] Backend running and accessible
- [ ] CORS configured for your domain
- [ ] Test form submission works
- [ ] Error handling implemented
- [ ] Success message shows
- [ ] Form resets after submission
- [ ] Loading state during submission
- [ ] Email validation on frontend
- [ ] Rate limiting (optional but recommended)
- [ ] Honeypot field (optional but recommended)
- [ ] Monitor submissions in dashboard

---

## 📞 Example Integration

### React/Next.js

```jsx
import axios from 'axios';
import { useState } from 'react';

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            business: formData.get('business'),
            contact: formData.get('contact'),
            message: formData.get('message')
        };

        try {
            await axios.post(
                'https://enquiry.thumbeja.com/spring/api/contact',
                data,
                { 
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: false 
                }
            );
            setMessage('Thank you! Your message has been sent.');
            e.target.reset();
        } catch (err) {
            setMessage('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <button disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
            </button>
            {message && <p>{message}</p>}
        </form>
    );
}
```

### Vanilla JavaScript

```javascript
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('https://enquiry.thumbeja.com/spring/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Message sent successfully!');
            e.target.reset();
        } else {
            alert('Failed to send message');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});
```

---

**Last Updated:** 2025
