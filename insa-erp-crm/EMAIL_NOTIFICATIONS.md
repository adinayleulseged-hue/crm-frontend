# Email Notifications System

## ✅ What's Working Now

### 1. **User & Customer Invitations** 📧
When admin creates users or invites customers, emails are automatically sent with login credentials.

#### Invite Customer:
- **Trigger:** Admin clicks "Invite Customer" and submits form
- **Email To:** Customer's email address
- **Email Contains:**
  - Welcome message
  - Email address (used as username)
  - Temporary password (6 characters)
  - Login link: http://localhost:3000/customer-login
  - Instructions to change password on first login

#### Create User:
- **Trigger:** Admin clicks "Add New User" and submits form
- **Email To:** User's email address
- **Email Contains:**
  - Account creation notification
  - Username
  - Email address
  - Temporary password (8 characters)
  - Role assigned
  - Login link: http://localhost:3000/role-login

---

### 2. **Sales Deal Approval Notifications** 🎉 NEW!
When admin/sales manager approves a sales deal, customer receives automatic email notification.

#### Deal Approved:
- **Trigger:** Admin/Sales Manager approves a sales deal
- **Email To:** Customer's email address (linked to the deal)
- **Email Contains:**
  - Congratulations message
  - Deal ID
  - Deal title/name
  - Deal value
  - Discount approved (if any)
  - Next steps: "You can now place your order"
  - Login link to customer portal

**Example Email:**
```
Subject: INSA CRM - Your Sales Deal Has Been Approved!

Dear [Company Name],

Good news! Your sales deal has been APPROVED.

Deal Details:
- Deal ID: 123
- Title: Office Equipment Purchase
- Value: $50,000
- Status: APPROVED
- Discount Approved: 5.00%

You can now proceed to place your order in the customer portal.

Login at: http://localhost:3000/customer-login

Thank you for your business!

Best regards,
INSA Sales Team
```

---

### 3. **Sales Deal Rejection Notifications** ❌ NEW!
When admin/sales manager rejects a sales deal, customer receives automatic email notification.

#### Deal Rejected:
- **Trigger:** Admin/Sales Manager rejects a sales deal
- **Email To:** Customer's email address (linked to the deal)
- **Email Contains:**
  - Polite rejection message
  - Deal ID
  - Deal title/name
  - Reason for rejection
  - Invitation to contact sales team
  - Future business encouragement

**Example Email:**
```
Subject: INSA CRM - Sales Deal Status Update

Dear [Company Name],

We regret to inform you that your sales deal has been reviewed and we are unable to proceed at this time.

Deal Details:
- Deal ID: 123
- Title: Office Equipment Purchase
- Status: NOT APPROVED
- Reason: Budget constraints at this time

If you have any questions or would like to discuss this further, please contact our sales team.

We appreciate your interest and hope to work with you in the future.

Best regards,
INSA Sales Team
```

---

## 📧 Email Configuration

### Current Setup:
- **SMTP Server:** Gmail (smtp.gmail.com)
- **From Email:** adey81151@gmail.com
- **Authentication:** Gmail App Password
- **Status:** ✅ **ACTIVE** and sending real emails

### Testing Email:
1. Go to admin dashboard
2. Approve or reject a sales deal
3. Customer will receive email instantly!

---

## 🔔 Complete Notification Flow

### Customer Journey:
1. **Invitation** 📧
   - Admin invites customer
   - Email sent with login credentials
   - Customer logs in

2. **Deal Submission** 📝
   - Customer creates sales deal
   - Submits for approval

3. **Deal Review** 👀
   - Admin/Sales Manager reviews deal
   - Clicks "Approve" or "Reject"

4. **Notification** 📧
   - **If Approved:** Customer gets success email → Can place order
   - **If Rejected:** Customer gets update email → Can contact sales team

5. **Order Process** 🛒
   - Customer places order (if approved)
   - Invoice generated
   - Payment processed
   - Delivery scheduled

---

## 🚀 Future Email Notifications (Coming Soon)

### Planned Notifications:
- ✅ **Order Confirmation:** Email when order is placed
- ✅ **Invoice Ready:** Email when invoice is generated
- ✅ **Payment Received:** Email when payment is confirmed
- ✅ **Delivery Scheduled:** Email with delivery details
- ✅ **Delivery Confirmed:** Email when goods delivered
- ✅ **Quotation Ready:** Email when quotation is generated
- ✅ **Password Reset:** Email with reset link

---

## 🎯 Benefits

### For Customers:
- ✅ Instant notifications about deal status
- ✅ No need to keep checking portal
- ✅ Clear next steps in every email
- ✅ Professional communication

### For Admin/Sales Team:
- ✅ Automatic notifications reduce manual work
- ✅ Customers stay informed
- ✅ Better customer experience
- ✅ Reduced support queries

### For Business:
- ✅ Professional image
- ✅ Improved customer satisfaction
- ✅ Faster decision-to-action time
- ✅ Better tracking and audit trail

---

## 🔧 Technical Details

### Backend Implementation:
- **Service:** `OpportunityService.java`
- **Methods:**
  - `approveDeal()` - Sends approval email
  - `rejectDeal()` - Sends rejection email
- **Email Service:** `EmailService.send()`
- **Error Handling:** Email failures don't block deal approval/rejection

### Email Sending:
- Uses Spring Boot JavaMailSender
- Connects to Gmail SMTP
- Sends in background thread
- Logs success/failure
- Falls back gracefully if email fails

### Security:
- ✅ Gmail App Password (not regular password)
- ✅ TLS encryption (port 587)
- ✅ Can revoke access anytime
- ✅ Credentials in application.properties (gitignored)

---

## 📝 Testing Guide

### Test Deal Approval Email:
1. Login as admin: http://localhost:3000/role-login
2. Go to "Sales Deals" or "Opportunities"
3. Find a pending deal
4. Click "Approve"
5. Enter discount (optional)
6. Submit
7. **Check customer's email inbox!**

### Test Deal Rejection Email:
1. Login as admin
2. Go to "Sales Deals" or "Opportunities"
3. Find a pending deal
4. Click "Reject"
5. Enter reason
6. Submit
7. **Check customer's email inbox!**

---

## ⚠️ Troubleshooting

### Email Not Received?
1. **Check spam folder** - Gmail might filter it
2. **Check backend logs** - Look for "email sent successfully"
3. **Verify customer email** - Make sure customer has valid email in database
4. **Check App Password** - Make sure it's still valid

### Backend Logs Show Error?
```
Failed to send approval notification email
```
- Check Gmail App Password is correct
- Check internet connection
- Check Gmail account not blocked
- Try regenerating App Password

### Customer Email is Empty?
- Email won't be sent if customer has no email address
- Update customer profile to add email

---

## 📊 Email Statistics (Future Feature)

Coming soon:
- Track how many emails sent
- Track delivery rate
- Track open rate (if using email service with tracking)
- Resend failed emails
- Email logs and history

---

## 🎉 Summary

✅ **3 Email Notifications Active:**
1. Customer Invitation (with login credentials)
2. User Creation (with login credentials)
3. Sales Deal Approval/Rejection

✅ **Gmail SMTP Configured**
✅ **Real Emails Being Sent**
✅ **Professional Email Templates**
✅ **Error Handling Implemented**

**The system is ready and working!** 🚀
