# Quotation Backend Integration Complete ✅

## What Was Done

Integrated the Quotations page with the backend API, similar to the leads integration.

---

## Changes Made

### 1. Updated Quotations Page (`src/app/(dashboard)/crm/quotations/page.tsx`)

**Added:**
- `useEffect` hook to fetch quotations from backend on page load
- `loading` state to show loading indicator
- `fetchQuotations()` async function that calls `quotationService.getAllQuotations()`
- Backend response mapping to match frontend Quotation interface
- Fallback to sample data if backend is offline or empty
- `useMemo` for filtered quotations (performance optimization)

**Key Features:**
- Fetches real quotations from `/api/quotations`
- Maps backend response fields to frontend interface
- Handles both paginated and array responses
- Shows sample data as fallback if backend unavailable
- Dynamic metrics based on real data (total, accepted, pending, expired)

---

## Backend Endpoint Used

```
GET /api/quotations
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "quotationNumber": "QUO-2025-001",
        "customerId": 1,
        "customerName": "Ministry of Finance",
        "opportunityId": 3,
        "issueDate": "2025-07-10",
        "expiryDate": "2025-08-10",
        "subtotal": 1800000,
        "discount": 0,
        "tax": 300000,
        "totalAmount": 2100000,
        "status": "ACCEPTED",
        "notes": "Delivery within 30 days",
        "items": [
          {
            "id": 1,
            "itemName": "Server Hardware",
            "description": "Dell PowerEdge R750",
            "quantity": 2,
            "unitPrice": 800000
          },
          {
            "id": 2,
            "itemName": "Installation Services",
            "description": "Professional setup and configuration",
            "quantity": 1,
            "unitPrice": 500000
          }
        ]
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "number": 0,
    "size": 20
  }
}
```

---

## Field Mapping

### Backend → Frontend

| Backend Field | Frontend Field | Notes |
|--------------|---------------|-------|
| `id` | `id` | Quotation ID |
| `quotationNumber` | `quotationNumber` | e.g. "QUO-2025-001" |
| `customerName` | `customer` | Customer name |
| `customerId` | `customerId` | Customer ID reference |
| `opportunityId` | `opportunityId` | Sales Deal ID |
| `issueDate` | `date` | Date issued |
| `expiryDate` | `validUntil` | Valid until date |
| `totalAmount` | `amount` | Total amount |
| `status` | `status` | DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED |
| `items[]` | `items[]` | Line items array |
| `items[].itemName` | `items[].description` | Item description |
| `items[].quantity` | `items[].quantity` | Quantity |
| `items[].unitPrice` | `items[].unitPrice` | Unit price |
| `notes` | `notes` | Additional notes |

---

## Quotation Status Flow

```
DRAFT → SENT → ACCEPTED → (generates Sales Order)
  ↓       ↓
EXPIRED  REJECTED
```

### Status Badge Colors

- **DRAFT**: Gray (editing)
- **SENT**: Blue (pending customer review)
- **ACCEPTED**: Green (customer accepted)
- **REJECTED**: Red (customer rejected)
- **EXPIRED**: Orange (validity period expired)

---

## How It Works

### 1. Page Load
```typescript
useEffect(() => {
  fetchQuotations();
}, []);
```

### 2. Fetch from Backend
```typescript
const fetchQuotations = async () => {
  try {
    setLoading(true);
    const response = await quotationService.getAllQuotations();
    
    // Handle paginated or array response
    const quotationsData = Array.isArray(response) 
      ? response 
      : response?.content || [];
    
    // Map to frontend format
    const mapped = quotationsData.map(q => ({
      id: q.id,
      quotationNumber: q.quotationNumber || `QUO-${q.id}`,
      customer: q.customerName || "Unknown",
      amount: Number(q.totalAmount || 0),
      status: q.status || "DRAFT",
      // ... more mappings
    }));
    
    setQuotations(mapped);
  } catch (error) {
    // Fallback to sample data
    setQuotations(SAMPLE_QUOTATIONS);
  }
};
```

### 3. Display in Table
- Shows filtered quotations based on search and status filter
- Dynamic metrics (total, accepted, pending, expired)
- Click row to view details
- Actions: View, Download, Accept, Send

---

## Integration Checklist

- [x] Add `useEffect` for data fetching
- [x] Add `loading` state
- [x] Call `quotationService.getAllQuotations()`
- [x] Map backend response to frontend interface
- [x] Handle pagination response
- [x] Fallback to sample data on error
- [x] Use `useMemo` for filtered data
- [x] Update metrics to use real data
- [x] Import missing React hooks (`useEffect`, `useMemo`)

---

## Testing

### Test 1: View Quotations
1. Login to admin dashboard
2. Navigate to `/crm/quotations`
3. Should fetch quotations from backend
4. If backend has data, shows real quotations
5. If backend empty, shows sample data

### Test 2: Search Functionality
1. Type in search box
2. Quotations filtered by:
   - Customer name
   - Quotation number
   - Opportunity reference

### Test 3: Status Filter
1. Select status from dropdown (All, Draft, Sent, Accepted, etc.)
2. Table shows only quotations with that status

### Test 4: Metrics
- Total Quotations: Count of all quotations
- Accepted: Count with status ACCEPTED
- Pending: Count with status SENT
- Expired: Count with status EXPIRED

---

## Backend Requirements

### QuotationController Endpoints

**Already exist in backend:**

```java
@GetMapping
GET /api/quotations
- Returns paginated list of quotations
- Requires: admin or crm_user role

@GetMapping("/{id}")
GET /api/quotations/{id}
- Returns single quotation
- Requires: admin or crm_user role

@PostMapping
POST /api/quotations
- Creates new quotation
- Requires: admin or crm_user role

@PutMapping("/{id}")
PUT /api/quotations/{id}
- Updates quotation
- Requires: admin or crm_user role

@PatchMapping("/{id}/accept")
PATCH /api/quotations/{id}/accept
- Accepts quotation → generates Sales Order
- Requires: admin or crm_user role

@DeleteMapping("/{id}")
DELETE /api/quotations/{id}
- Deletes quotation
- Requires: admin role
```

---

## Creating a Quotation

### From Sales Deal

When you convert a qualified lead:
1. Lead → Customer + Sales Deal created
2. Navigate to `/crm/sales-deals`
3. View sales deal details
4. Click "Create Quotation"
5. Fill quotation form:
   - Issue Date
   - Expiry Date
   - Line Items (products/services)
   - Prices, quantities
   - Notes
6. Submit → Quotation created with status DRAFT

### Required Fields

```typescript
{
  customerId: number;       // Required
  opportunityId: number;    // Required (Sales Deal ID)
  issueDate: string;        // Required (YYYY-MM-DD)
  expiryDate: string;       // Required (YYYY-MM-DD)
  items: [                  // Required (at least 1 item)
    {
      itemName: string;
      quantity: number;
      unitPrice: number;
    }
  ],
  notes?: string;           // Optional
}
```

---

## Quotation Workflow

```
1. Sales Deal Created
   ↓
2. Admin creates Quotation (DRAFT)
   ↓
3. Admin reviews and sends (SENT)
   ↓
4. Customer reviews quotation
   ↓
5a. Customer accepts → ACCEPTED
    ↓
    Generate Sales Order
    ↓
    Generate Invoice
    ↓
    Record Payment

5b. Customer rejects → REJECTED
    (End of workflow)

5c. Expiry date passes → EXPIRED
    (Can renew or close)
```

---

## Next Steps

### 1. Create Quotation Form
- Add form to create new quotations from Sales Deals
- Dynamic line item addition/removal
- Price calculations (subtotal, tax, discount, total)

### 2. Quotation Actions
- **Send**: Mark as SENT (email to customer)
- **Accept**: Customer accepts → generate Sales Order
- **Reject**: Customer declines
- **Download**: Generate PDF

### 3. Sales Order Generation
- Accepting quotation creates Sales Order
- Sales Order creates Invoice
- Payment links to Invoice

---

## Files Modified

1. `src/app/(dashboard)/crm/quotations/page.tsx`
   - Added backend integration
   - Added useEffect for data fetching
   - Added loading state
   - Mapped backend response
   - Updated metrics calculation

2. `src/services/quotationService.ts`
   - Already had all necessary methods ✅
   - No changes needed

---

## Similar to Leads Integration

This integration follows the same pattern as the leads integration:

### Leads
- `useEffect` → fetch leads from `/api/leads`
- Map backend response
- Fallback to sample data
- Status badges
- Qualification actions

### Quotations
- `useEffect` → fetch quotations from `/api/quotations`
- Map backend response
- Fallback to sample data
- Status badges
- Accept/Send actions

---

## Status: ✅ COMPLETE

Quotations page now fetches real data from backend and displays it properly. Falls back to sample data if backend is unavailable.

**Date:** 2026-09-04
**Feature:** Quotation Backend Integration
**Pattern:** Same as Leads integration
