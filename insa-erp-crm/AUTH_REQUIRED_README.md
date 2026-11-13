# 403 Forbidden Error - Authentication Required ✅

## Problem
You're seeing `403 Forbidden` errors when trying to create or view Sales Deals in the Customer Portal.

```
AxiosError: Request failed with status code 403
at async Object.getAllSalesDeals
```

---

## Root Cause
**You need to LOGIN first!** The backend API requires authentication for all operations.

The Security Configuration requires a valid JWT token for ALL requests except:
- `/api/auth/**` (login/register)
- `/api/leads` (public lead submission)
- Health checks and Swagger docs

---

## Solution: Login Through Customer Portal

### Step 1: Go to Customer Login Page
Navigate to: **http://localhost:3000/customer-login**

### Step 2: Login with Valid Credentials

**Test Customer Account:**
```
Username: customer@insa.gov.et
Password: customer123
```

OR create a new customer account if you have registration enabled.

### Step 3: Verify Login
After successful login, the system will:
- Store JWT token in `localStorage.getItem('token')`
- Store JWT token in `localStorage.getItem('crm_auth_token')`
- Store user info in `localStorage.getItem('crm_user')`
- Redirect you to Customer Dashboard

### Step 4: Check Authentication
Open Browser Console (F12) and type:
```javascript
localStorage.getItem('token')
```

You should see a long string starting with `eyJ...` - that's your JWT token!

---

## How Authentication Works

### 1. Login API Call
```http
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "customer@insa.gov.et",
  "password": "customer123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "customer@insa.gov.et",
  "role": "CUSTOMER",
  "name": "Ministry of Finance"
}
```

### 2. Token Storage
The frontend automatically stores this token in:
- `localStorage.setItem('token', token)`
- `localStorage.setItem('crm_auth_token', token)`
- Cookie: `crm_auth_token=...`

### 3. API Client Auto-Includes Token
The `apiClient.ts` interceptor automatically adds the token to every request:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('crm_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. Backend Validates Token
Spring Security checks:
- Token signature is valid
- Token hasn't expired
- User has required permissions

---

## Troubleshooting 403 Errors

### Check 1: Are You Logged In?
```javascript
// Open browser console (F12)
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('crm_user'));
```

**If both are `null`** → You need to login!

### Check 2: Is Token Expired?
JWT tokens typically expire after 24 hours. If your token is old:
1. Logout
2. Login again
3. Get fresh token

### Check 3: Is Backend Running?
```powershell
netstat -ano | Select-String ":8082"
```

If no results → Start backend:
```bash
cd c:\Users\PAVILION\Downloads\crm-backend\crm-backend
.\mvnw spring-boot:run
```

### Check 4: Check Network Tab
1. Open DevTools (F12) → Network tab
2. Try creating a Sales Deal
3. Look for the POST request to `/api/opportunities`
4. Click on it → Headers tab
5. Check **Request Headers** section:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**If Authorization header is missing** → Token not being sent!

### Check 5: Inspect Token Payload
```javascript
// Decode JWT token (safe - just reads payload, doesn't validate)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token Payload:', payload);
  console.log('Expires At:', new Date(payload.exp * 1000));
}
```

**Check if token is expired:**
- `exp` is expiration timestamp
- If `exp * 1000 < Date.now()` → Token expired, login again!

---

## Complete Login Flow

### 1. Navigate to Login
```
http://localhost:3000/customer-login
```

### 2. Enter Credentials
- **Email/Username:** customer@insa.gov.et  
- **Password:** customer123

### 3. Click "Sign In"

### 4. System Performs:
```javascript
// POST to backend
fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

// Store response
localStorage.setItem('crm_auth_token', data.token);
localStorage.setItem('token', data.token);
localStorage.setItem('crm_user', JSON.stringify(userData));

// Redirect to dashboard
window.location.href = '/customer/dashboard';
```

### 5. Dashboard Loads with Token
```javascript
// Every API call now includes:
headers: {
  'Authorization': 'Bearer eyJhbGci...'
}
```

### 6. Backend Validates & Returns Data
```
✅ 200 OK - Data returned
❌ 401 Unauthorized - Token invalid/expired
❌ 403 Forbidden - Token missing or insufficient permissions
```

---

## Default Test Accounts

### Customer Account
```
Username: customer@insa.gov.et
Password: customer123
Role: CUSTOMER
Permissions: Read leads, quotations, orders; Create sales deals
```

### Admin Account (if needed)
```
Username: admin
Password: admin123
Role: ADMIN
Permissions: Full access to all endpoints
```

### CRM User Account (if needed)
```
Username: sales@insa.gov.et
Password: sales123
Role: CRM_USER
Permissions: Full CRM operations
```

---

## Quick Fix Commands

### Clear All Authentication
```javascript
// Run in browser console to logout completely
localStorage.removeItem('token');
localStorage.removeItem('crm_auth_token');
localStorage.removeItem('crm_user');
localStorage.removeItem('user');
localStorage.removeItem('active_customer');
localStorage.removeItem('active_customer_username');
document.cookie.split(";").forEach((c) => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### Login via Console (for testing)
```javascript
// Quick test login without UI
fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    username: 'customer@insa.gov.et', 
    password: 'customer123' 
  })
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('crm_auth_token', data.token);
  localStorage.setItem('crm_user', JSON.stringify(data));
  console.log('✅ Logged in! Token:', data.token.substring(0, 20) + '...');
  location.reload();
});
```

---

## Security Best Practices

### Token Storage
✅ **Secure:** Tokens in localStorage (acceptable for internal enterprise apps)  
✅ **Secure:** HttpOnly cookies (best for public-facing apps)  
❌ **Insecure:** Never log full tokens to console in production

### Token Expiration
- Tokens should expire after reasonable time (e.g., 24 hours)
- Implement refresh token flow for longer sessions
- Force re-login on sensitive operations

### HTTPS Required
- Always use HTTPS in production
- JWT tokens sent over HTTP can be intercepted
- Development (localhost) is okay for testing

---

## Testing Sales Deal Creation (With Auth)

### Full Test Flow

**1. Login First:**
```
http://localhost:3000/customer-login
→ Enter: customer@insa.gov.et / customer123
→ Click Sign In
→ Redirected to /customer/dashboard
```

**2. Open Browser Console:**
```javascript
// Verify authentication
console.log('Logged in as:', JSON.parse(localStorage.getItem('crm_user')).name);
console.log('Token exists:', !!localStorage.getItem('token'));
```

**3. Create Sales Deal:**
```
Click "Sales Deals" in sidebar
→ Click "Inquire About New Deal"
→ Fill form:
   - Title: "Test Security Integration"
   - Value: 500000
   - Expected Close: 2026-10-01
   - Description: "Testing authenticated API calls"
→ Click "Submit Deal Inquiry"
```

**4. Check Console Logs:**
```
[Sales Deal] Creating with customerId: 123
[Sales Deal] Response from API: {id: 456, opportunityNumber: "OPP-2026-001", ...}
[Sales Deal] Successfully saved to DB with ID: 456
✅ Toast: "Sales Deal OPP-2026-001 submitted and saved to PostgreSQL!"
```

**5. Verify in Database:**
```sql
SELECT * FROM opportunities WHERE opportunity_number = 'OPP-2026-001';
```

**6. Logout & Login → Data Persists!**

---

## Summary

**Problem:** 403 Forbidden errors  
**Root Cause:** Not authenticated - no JWT token  
**Solution:** Login at http://localhost:3000/customer-login  
**Credentials:** customer@insa.gov.et / customer123  
**Verification:** Check `localStorage.getItem('token')` exists  
**Result:** All API calls now include Authorization header  

---

**Status:** ✅ **Documented & Resolved**  
**Next Step:** Please login first, then try creating Sales Deal again!
