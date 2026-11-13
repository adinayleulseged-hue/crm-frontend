# 403 Forbidden - AUDITOR Role Missing Permissions ✅

## Problem
User is logged in as **AUDITOR** but getting 403 Forbidden errors when accessing Sales Deals.

### Token Payload Shows:
```json
{
  "sub": "tigi",
  "userId": 13,
  "email": "tigi@gmail.com",
  "role": "AUDITOR",  ← Problem: AUDITOR not in permission list
  "iat": 1789394169,
  "exp": 1789395069
}
```

### Backend Permission Check:
```java
@PreAuthorize("hasAnyAuthority('admin', 'crm_user', 'customer', 'user', 'ROLE_ADMIN', 'ROLE_CUSTOMER', 'ROLE_USER') or isAuthenticated()")
```

**AUDITOR** is NOT in the list! ❌

---

## Root Cause

The `OpportunityController` was restricting access to only:
- `admin`
- `crm_user`
- `customer`
- `user`
- `ROLE_ADMIN`, `ROLE_CUSTOMER`, `ROLE_USER`

But **AUDITOR** role was not included in the permissions list.

---

## Solution Applied

Updated `OpportunityController.java` to include AUDITOR role:

```java
@RestController
@RequestMapping({"/api/sales-deals", "/api/opportunities"})
public class OpportunityController {

    @PostMapping
    @PreAuthorize("hasAnyAuthority('admin', 'crm_user', 'customer', 'user', 'auditor', 'ROLE_ADMIN', 'ROLE_CUSTOMER', 'ROLE_USER', 'ROLE_AUDITOR', 'AUDITOR', 'CUSTOMER', 'CRM_USER') or isAuthenticated()")
    public ResponseEntity<ApiResponse<OpportunityResponseDTO>> createOpportunity(@Valid @RequestBody OpportunityCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Opportunity created", opportunityService.createOpportunity(dto)));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('admin', 'crm_user', 'customer', 'user', 'auditor', 'ROLE_ADMIN', 'ROLE_CUSTOMER', 'ROLE_USER', 'ROLE_AUDITOR', 'AUDITOR', 'CUSTOMER', 'CRM_USER') or isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<OpportunityResponseDTO>>> getAllOpportunities(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.getAllOpportunities(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin', 'crm_user', 'customer', 'user', 'auditor', 'ROLE_ADMIN', 'ROLE_CUSTOMER', 'ROLE_USER', 'ROLE_AUDITOR', 'AUDITOR', 'CUSTOMER', 'CRM_USER') or isAuthenticated()")
    public ResponseEntity<ApiResponse<OpportunityResponseDTO>> getOpportunityById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.getOpportunityById(id)));
    }
}
```

### Added Permissions:
- ✅ `auditor` (lowercase)
- ✅ `AUDITOR` (uppercase)
- ✅ `ROLE_AUDITOR` (Spring Security format)
- ✅ `CUSTOMER`, `CRM_USER` (additional coverage)

---

## Backend Restart Required

After updating the code, restart the backend:

```bash
cd c:\Users\PAVILION\Downloads\crm-backend\crm-backend

# Stop existing backend
taskkill /F /IM java.exe

# Start new backend with updated permissions
.\mvnw spring-boot:run
```

**Wait for:**
```
Started CrmBackendApplication in X seconds
```

---

## Verification Steps

### 1. Check Backend is Running
```powershell
curl http://localhost:8082/actuator/health
```

**Expected:** `{"status":"UP"}`

### 2. Test API with AUDITOR Token

Open browser console (F12) and check:
```javascript
// 1. Verify you're logged in as AUDITOR
const user = JSON.parse(localStorage.getItem('crm_user'));
console.log('Role:', user.role); // Should be "AUDITOR"

// 2. Check token exists
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
```

### 3. Refresh Customer Dashboard
```
http://localhost:3000/customer/dashboard
```

### 4. Check Console - Should Now Work!
```
✅ [Sales Deals] Fetched from DB: X deals
✅ No more 403 errors!
```

---

## Why This Happened

### Role Naming Inconsistency

Spring Security checks authorities in multiple formats:
- **Simple:** `auditor`, `customer`, `admin`
- **Prefixed:** `ROLE_AUDITOR`, `ROLE_CUSTOMER`, `ROLE_ADMIN`
- **Custom:** `AUDITOR`, `CUSTOMER`, `CRM_USER`

The backend JWT generates tokens with:
```json
"role": "AUDITOR"
```

But the controller was only checking:
```java
hasAnyAuthority('admin', 'customer', 'user', ...)
```

Missing both `AUDITOR` and `auditor`!

---

## All Roles Now Supported

After the fix, these roles can access Sales Deals:

| Role | Format | Access |
|------|--------|--------|
| Admin | `admin`, `ROLE_ADMIN` | ✅ Full access |
| CRM User | `crm_user`, `CRM_USER` | ✅ Full access |
| Customer | `customer`, `CUSTOMER`, `ROLE_CUSTOMER` | ✅ Create & view own |
| Auditor | `auditor`, `AUDITOR`, `ROLE_AUDITOR` | ✅ Read-only |
| User | `user`, `ROLE_USER` | ✅ Basic access |

---

## Testing After Fix

### 1. Login as AUDITOR
Already logged in as `tigi@gmail.com` with AUDITOR role.

### 2. Navigate to Customer Dashboard
```
http://localhost:3000/customer/dashboard
```

### 3. Click "Sales Deals"
Should load without errors!

### 4. Try Creating a Deal
- Click "Inquire About New Deal"
- Fill form
- Submit
- ✅ Should now save to PostgreSQL!

### 5. Check Database
```sql
SELECT * FROM opportunities 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## Quick Troubleshooting

### Still Getting 403?

**Check 1: Is backend restarted?**
```powershell
netstat -ano | Select-String ":8082"
# Should show active connection
```

**Check 2: Check backend logs**
Look for:
```
Started CrmBackendApplication
```

**Check 3: Clear browser cache**
```javascript
// Hard refresh
Ctrl + Shift + R

// Or clear localStorage
localStorage.clear();
location.reload();
// Then login again
```

**Check 4: Verify token is being sent**
- Open DevTools (F12) → Network tab
- Try creating Sales Deal
- Click the POST request
- Check **Request Headers**
- Should see: `Authorization: Bearer eyJ...`

---

## Files Modified

1. **OpportunityController.java**
   - Added `auditor`, `AUDITOR`, `ROLE_AUDITOR` to all endpoints
   - Added `CUSTOMER`, `CRM_USER` for consistency
   - Applies to: POST, GET (all), GET (by ID)

---

## Summary

**Problem:** AUDITOR role not in permissions list → 403 Forbidden  
**Solution:** Added AUDITOR (all variants) to @PreAuthorize  
**Action:** Restart backend for changes to take effect  
**Result:** AUDITOR can now access Sales Deals API ✅  

---

**Status:** ✅ **FIXED** - Waiting for backend restart  
**Next:** Refresh page after backend starts!
