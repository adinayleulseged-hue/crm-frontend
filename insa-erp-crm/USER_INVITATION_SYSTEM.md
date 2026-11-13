# User & Customer Invitation System

## Overview
The CRM system now has a complete invitation system where admins can create users and invite customers with **auto-generated passwords** that are sent via email automatically.

## Features

### 1. **Invite Customer** (New)
- Green button in admin dashboard: "Invite Customer"
- Auto-generates 6-character temporary password
- Creates both Customer record AND auth User account
- Automatically sends credentials via email
- Falls back to showing password in UI if email fails

### 2. **Add New User** (Updated)
- Red button in admin dashboard: "Add New User"
- **Password field removed** - now auto-generated!
- Auto-generates 8-character temporary password
- Automatically sends credentials via email
- Falls back to showing password in modal if email fails

## User Flow

### Admin Invites Customer
1. Admin clicks **"Invite Customer"** button
2. Fills in customer details (company name, contact, email, phone, type)
3. System auto-generates password
4. Creates customer account + auth user (role: CUSTOMER)
5. **Sends email** with login credentials
6. If email fails: Shows password in modal for manual sharing

### Admin Creates User
1. Admin clicks **"Add New User"** button
2. Fills in username, email, and role
3. System auto-generates password
4. Creates auth user account
5. **Sends email** with login credentials
6. If email fails: Shows password in modal for manual sharing

## Email Configuration

### Quick Setup
Edit `crm-backend/src/main/resources/application.properties`:

```properties
# Gmail Example
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# From address
crm.notification.email.from=noreply@insa.gov.et

# Frontend URL for login links
app.frontend.url=http://localhost:3000
```

### Email Templates

#### Customer Invitation Email
```
Subject: Welcome to INSA CRM - Your Account Has Been Created

Dear [Contact Name],

Your customer account has been created in the INSA CRM system.

Login Details:
- Email: customer@example.com
- Temporary Password: ABC123

Please login at: http://localhost:3000/customer-login

For security reasons, please change your password after your first login.

Best regards,
INSA CRM Team
```

#### User Creation Email
```
Subject: INSA CRM - Your Account Has Been Created

Dear [Username],

Your account has been created in the INSA CRM system.

Login Details:
- Username: username
- Email: email@example.com
- Temporary Password: ABC123
- Role: SALES_OFFICER

Please login at: http://localhost:3000/role-login

Best regards,
INSA CRM Team
```

## Technical Details

### Backend Endpoints

#### 1. POST `/api/customers/invite`
Creates customer + auth user, sends invitation email
```json
Request:
{
  "companyName": "Ministry of Finance",
  "contactName": "Abebe Bekele",
  "email": "abebe@mof.gov.et",
  "phone": "+251911000000",
  "customerType": "GOVERNMENT"
}

Response (email sent):
{
  "success": true,
  "customerId": 123,
  "customerNumber": "CUST-1234567890",
  "email": "abebe@mof.gov.et",
  "emailSent": true,
  "message": "Customer invited successfully. Credentials sent via email."
}

Response (email failed):
{
  "success": true,
  "customerId": 123,
  "customerNumber": "CUST-1234567890",
  "email": "abebe@mof.gov.et",
  "temporaryPassword": "ABC123",
  "emailSent": false,
  "note": "Email service error. Share this password manually."
}
```

#### 2. POST `/api/auth/admin/create-user`
Creates user account, sends credentials email
```json
Request:
{
  "username": "aster.kebede",
  "email": "aster.kebede@insa.gov.et",
  "role": "SALES_OFFICER"
}

Response (email sent):
{
  "success": true,
  "userId": 456,
  "username": "aster.kebede",
  "email": "aster.kebede@insa.gov.et",
  "role": "SALES_OFFICER",
  "emailSent": true,
  "message": "User created successfully. Credentials sent via email."
}

Response (email failed):
{
  "success": true,
  "userId": 456,
  "username": "aster.kebede",
  "email": "aster.kebede@insa.gov.et",
  "role": "SALES_OFFICER",
  "temporaryPassword": "Abc12345",
  "emailSent": false,
  "note": "Email service error. Share this password manually."
}
```

### Backend Files Modified/Created

**Created:**
- `EmailService.java` - Handles email sending for invitations
- `CustomerInvitationController.java` - Customer invitation endpoint

**Modified:**
- `AuthController.java` - Added `/admin/create-user` endpoint

### Frontend Files Modified

**Modified:**
- `admin/page.tsx` - Added Invite Customer button, updated Create User modal, added credentials display modal
- `InviteCustomerModal.tsx` - Updated to handle email sent vs failed states

### Password Generation

**Customer Password (6 characters):**
- Characters: A-Z (excluding I, O), 2-9 (excluding 0, 1)
- Example: `A7K9B3`
- Easy to read, no ambiguous characters

**User Password (8 characters):**
- Characters: A-Z, a-z (excluding ambiguous), 2-9
- Example: `Abc12xyz`
- More secure, longer length

## UI Changes

### Admin Dashboard

**Before:**
```
[Add New User] button only
Form had: Username, Email, Password (manual), Role
```

**After:**
```
[Invite Customer] [Add New User] buttons
Invite Customer Form: Company, Contact, Email, Phone, Type
Add New User Form: Username, Email, Role (no password field)
Note: "A temporary password will be auto-generated and sent via email"
```

### Success States

**Email Sent:**
- Green success message
- "Email Sent!" notification
- No password shown

**Email Failed:**
- Modal shows credentials
- Yellow warning box
- Copy button for password
- Manual sharing instructions

## Security Features

✅ **Passwords auto-generated** - No weak user-chosen passwords  
✅ **Passwords hashed** - BCrypt encryption in database  
✅ **Email over UI** - Credentials sent via email, not displayed unless necessary  
✅ **Temporary passwords** - Users should change on first login  
✅ **Unique validation** - Checks for duplicate username/email before creation

## Testing Checklist

### With Email Configured
- [ ] Create customer → Email received with credentials
- [ ] Create user → Email received with credentials
- [ ] Customer can login with emailed password
- [ ] User can login with emailed password

### Without Email (Fallback)
- [ ] Create customer → Modal shows password
- [ ] Create user → Modal shows password
- [ ] Copy button works for password
- [ ] Customer can login with shown password
- [ ] User can login with shown password

### Error Handling
- [ ] Duplicate email → Shows error message
- [ ] Duplicate username → Shows error message
- [ ] Invalid email format → Validation error
- [ ] Empty required fields → Validation error

## Troubleshooting

### Email Not Sending
1. Check backend logs: `tail -f logs/spring.log | grep -i mail`
2. Verify SMTP settings in `application.properties`
3. Test with Gmail app password or MailHog for development
4. Check firewall/port blocking (587, 465)

### User Can't Login
1. Verify user created in database: `SELECT * FROM auth_users WHERE username='...'`
2. Check password wasn't expired/changed
3. Verify correct login page (customer vs staff)
4. Check user role matches login type

### Password Not Showing in Fallback
1. Check browser console for errors
2. Verify modal state: `showCreatedUserModal`
3. Check `createdUserInfo` has password field
4. Backend should return `emailSent: false` and `temporaryPassword`

## Production Deployment

Use environment variables for security:

```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=noreply@insa.gov.et
export SMTP_PASSWORD=your-secure-app-password
export CRM_MAIL_FROM=noreply@insa.gov.et
export FRONTEND_URL=https://crm.insa.gov.et
```

## Future Enhancements

- [ ] Password reset functionality
- [ ] Force password change on first login
- [ ] Email templates with HTML formatting
- [ ] Invitation expiry (24-48 hours)
- [ ] Resend invitation option
- [ ] Email delivery status tracking
- [ ] SMS fallback for critical notifications
- [ ] Multi-language email templates
- [ ] Custom branding in emails

## References

- Email setup guide: `crm-backend/EMAIL_SETUP.md`
- Workflow documentation: `crm-frontend/insa-erp-crm/COMPLETE_WORKFLOW.md`
- API documentation: `http://localhost:8082/swagger-ui.html`
