# Lead-to-Payment Business Workflow

## Overview
Complete implementation of the lead-to-payment business process with qualification gates and proper status management.

---

## Workflow Steps

### 1. Anonymous Contact Form → Lead Creation
**Route:** `/contact` (public, no authentication required)

**Process:**
- Anonymous user fills out Contact Us form with:
  - First Name, Last Name
  - Company
  - Email, Phone
  - Message
- Form submits to `POST /api/leads` with:
  - `source: "WEBSITE"`
  - `status: "NEW"` (automatically set by backend)
  - `notes: message content`
  - `internalNotes: "Lead submitted via public Contact Us form - pending admin qualification"`

**Implementation:**
- File: `src/app/contact/page.tsx`
- Service: `leadService.createLead()`
- Backend: No `@PreAuthorize` on POST /api/leads (accessible without auth)

---

### 2. Admin Reviews Lead → Qualification
**Route:** `/crm/leads` (admin/CRM user only)

**Process:**
- Admin views all leads in table with Status column
- Status badges show: NEW, CONTACTED, QUALIFIED, UNQUALIFIED, LOST, CONVERTED
- For leads with status NEW or CONTACTED, admin sees:
  - **Qualify** button (green) → Sets status to `QUALIFIED`
  - **Disqualify** button (red) → Sets status to `UNQUALIFIED`

**Implementation:**
- File: `src/app/(dashboard)/crm/leads/page.tsx`
- Service: `leadService.updateLeadStatus(leadId, "QUALIFIED" | "UNQUALIFIED")`
- Backend: `PATCH /api/leads/{id}/status?status=QUALIFIED`
- UI: Color-coded status badges, conditional button display

**Business Rule:**
- Only NEW or CONTACTED leads show qualification buttons
- Status transitions validated by backend `DomainStatusGuard`

---

### 3. Qualified Lead Gets Login Access
**Process:**
- After qualification, admin can create user credentials for the lead
- Lead receives login credentials (implementation depends on user management flow)
- Qualified lead can now access customer portal

**Note:** User creation flow is separate from lead qualification

---

### 4. Admin Converts Lead → Customer + Sales Deal
**Route:** `/crm/leads` (Convert action on qualified lead)

**Process:**
- Admin clicks "Convert Lead" on a QUALIFIED lead
- System creates:
  - **Customer** record (from lead data: company, contact info)
  - **Sales Deal** (Opportunity) with:
    - Linked to new customer
    - Title: User-provided or auto-generated
    - Value: From lead budget or user-provided
    - Status: NEW_BUSINESS
    - Probability: 50%
- Lead status changes to `CONVERTED`

**Implementation:**
- Service: `leadService.convertLead(leadId, { conversionReason, createOpportunity: true, opportunityValue, opportunityTitle })`
- Backend: `PATCH /api/leads/{id}/convert`
- Backend automatically creates both Customer AND Opportunity in single transaction

**LeadConvertRequest:**
```typescript
{
  conversionReason?: string;
  createOpportunity?: boolean;  // default true
  opportunityValue?: number;
  opportunityTitle?: string;
}
```

---

### 5. Sales Deal → Quotation
**Route:** `/crm/sales-deals` (formerly `/crm/opportunities`)

**Process:**
- Admin views Sales Deal details
- Creates quotation from Sales Deal with:
  - Customer ID (from converted lead)
  - Opportunity/Sales Deal ID
  - Line items (products/services)
  - Pricing, taxes, discounts
  - Issue date and expiry date

**Implementation:**
- Service: `quotationService.createQuotation()`
- Backend: `POST /api/quotations`

**QuotationCreateDTO:**
```typescript
{
  customerId: number;
  opportunityId: number;
  issueDate: string;
  expiryDate: string;
  items: Array<{
    itemName: string;
    sku?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal?: number;
  discount?: number;
  tax?: number;
  totalAmount?: number;
  notes?: string;
}
```

---

### 6. Quotation → Invoice (via Sales Order)
**Route:** `/crm/quotations`

**Process:**
- Customer reviews quotation
- Admin accepts quotation → Creates Sales Order
- Sales Order automatically generates Invoice

**Implementation:**
- Service: `quotationService.acceptQuotation(quotationId)`
- Backend: `PATCH /api/quotations/{id}/accept`
- Returns: `SalesOrderResponseDTO` (which includes invoice)

**Flow:**
1. Quotation status: DRAFT → SENT → ACCEPTED
2. Accept action creates SalesOrder
3. SalesOrder creation triggers Invoice generation

---

### 7. Invoice → Payment
**Route:** `/crm/invoices` → `/crm/payments`

**Process:**
- Invoice created from Sales Order
- Customer makes payment
- Admin records payment against invoice

**Implementation:**
- Invoice already linked to Sales Order and Customer
- Payment service links to Invoice ID
- Backend: Existing payment endpoints handle invoice payment tracking

---

## Terminology Changes

### Frontend Rebranding: Opportunity → Sales Deal

**Routes:**
- `/crm/opportunities` → `/crm/sales-deals`

**Services:**
- `opportunityService.ts` → `salesDealService.ts`
- Method names: `getAllOpportunities()` → `getAllSalesDeals()`

**Types:**
- `opportunity.types.ts` → `salesDeal.types.ts`
- `Opportunity` → `SalesDeal`
- `OpportunityRequest` → `SalesDealRequest`
- `OpportunityResponse` → `SalesDealResponse`

**Navigation:**
- Sidebar menu: "Opportunities" → "Sales Deals"

**Backend:**
- NO CHANGES - Backend still uses `/api/opportunities` endpoint
- This is intentional to avoid breaking API contracts

---

## Key Backend Endpoints

### Lead Management
- `POST /api/leads` - Create lead (no auth required)
- `GET /api/leads` - List leads (admin/crm_user)
- `PATCH /api/leads/{id}/status?status=QUALIFIED` - Qualify lead
- `PATCH /api/leads/{id}/convert` - Convert to customer + opportunity

### Customer & Sales Deal
- Created automatically during lead conversion
- `GET /api/customers/{id}` - View customer
- `GET /api/opportunities/{id}` - View sales deal (still called opportunity in backend)

### Quotation Flow
- `POST /api/quotations` - Create quotation
- `PATCH /api/quotations/{id}/accept` - Accept → Generate Sales Order + Invoice

### Invoice & Payment
- Invoice auto-created from Sales Order
- `GET /api/invoices` - List invoices
- `POST /api/payments` - Record payment

---

## Status Transitions

### Lead Status Flow
```
NEW → CONTACTED → QUALIFIED → CONVERTED
  ↓
UNQUALIFIED / LOST
```

### Quotation Status Flow
```
DRAFT → SENT → ACCEPTED → (generates Sales Order)
  ↓
REJECTED / EXPIRED
```

### Invoice Status Flow
```
UNPAID → PARTIALLY_PAID → PAID
  ↓
OVERDUE / CANCELLED
```

---

## Files Modified

### New Files Created
1. `src/app/contact/page.tsx` - Public contact form
2. `BUSINESS_WORKFLOW.md` - This documentation

### Modified Files
1. `src/app/(dashboard)/crm/leads/page.tsx` - Added status badges and qualification buttons
2. `src/services/leadService.ts` - Added updateLeadStatus() and improved convertLead()
3. `src/types/lead.types.ts` - Added LeadStatus type and LeadConvertRequest
4. `components/layout/Sidebar.tsx` - Updated "Opportunities" → "Sales Deals"

### Renamed/Moved Files
1. `src/app/(dashboard)/crm/opportunities/` → `src/app/(dashboard)/crm/sales-deals/`
2. `src/services/opportunityService.ts` → `src/services/salesDealService.ts`
3. `src/types/opportunity.types.ts` → `src/types/salesDeal.types.ts`

---

## Testing Checklist

### 1. Public Contact Form
- [ ] Navigate to `/contact` without logging in
- [ ] Fill out all required fields
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Check backend: Lead created with status=NEW, source=WEBSITE

### 2. Lead Qualification
- [ ] Log in as admin
- [ ] Navigate to `/crm/leads`
- [ ] Find lead with status NEW
- [ ] Click "Qualify" button
- [ ] Verify status changes to QUALIFIED (green badge)
- [ ] Find another NEW lead, click "Disqualify"
- [ ] Verify status changes to UNQUALIFIED (red badge)

### 3. Lead Conversion
- [ ] Select a QUALIFIED lead
- [ ] Click "Convert to Customer" (or similar action)
- [ ] Fill conversion form with opportunity title and value
- [ ] Submit
- [ ] Verify Customer created
- [ ] Verify Sales Deal created and linked
- [ ] Verify Lead status = CONVERTED

### 4. Sales Deal Navigation
- [ ] Check sidebar shows "Sales Deals" not "Opportunities"
- [ ] Click "Sales Deals" menu item
- [ ] Verify route is `/crm/sales-deals`
- [ ] Verify list shows converted sales deals

### 5. Quotation Creation
- [ ] From Sales Deal detail page
- [ ] Click "Create Quotation"
- [ ] Add line items with quantities and prices
- [ ] Set issue and expiry dates
- [ ] Submit
- [ ] Verify quotation created and linked to Sales Deal

### 6. Invoice Generation
- [ ] View quotation
- [ ] Click "Accept Quotation"
- [ ] Verify Sales Order created
- [ ] Verify Invoice auto-generated
- [ ] Navigate to `/crm/invoices`
- [ ] Verify invoice appears in list

### 7. Payment Recording
- [ ] Navigate to invoice detail
- [ ] Record payment
- [ ] Verify invoice status updates (UNPAID → PAID)
- [ ] Navigate to `/crm/payments`
- [ ] Verify payment recorded and linked to invoice

---

## Business Rules Enforced

1. **Anonymous Access:** Only `/contact` is accessible without login
2. **Qualification Gate:** Only NEW or CONTACTED leads can be qualified/disqualified
3. **Conversion Requirement:** Only QUALIFIED leads can be converted to customers
4. **Automatic Linking:** Lead conversion automatically creates both Customer AND Sales Deal
5. **Backend Validation:** `DomainStatusGuard` enforces valid status transitions
6. **Single Transaction:** Customer + Opportunity creation happens atomically

---

## Future Enhancements

1. **Email Notifications:** Notify leads when qualified/converted
2. **Customer Portal:** Allow qualified leads to log in and view their sales deal status
3. **Approval Workflow:** Multi-step approval for large-value conversions
4. **Campaign Tracking:** Link leads to marketing campaigns
5. **Territory Assignment:** Auto-assign leads based on region/territory
6. **Lead Scoring:** Automated lead scoring based on engagement
7. **Document Attachments:** Attach contracts to quotations/invoices

---

## Support

For questions or issues with this workflow:
1. Check backend logs at `crm-backend/logs/`
2. Verify database state in PostgreSQL
3. Review API responses in browser DevTools Network tab
4. Consult backend controllers:
   - `LeadController.java`
   - `CustomerController.java`
   - `OpportunityController.java`
   - `QuotationController.java`

---

**Last Updated:** 2025-09-03
**Version:** 1.0
**Status:** ✅ Implementation Complete
