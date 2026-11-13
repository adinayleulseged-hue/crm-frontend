# ✅ Invoice Generation Form with Backend Integration

## Summary
Professional invoice creation form that pulls real data from backend (customers, sales orders) with automatic VAT calculation and real-time totals.

---

## 🎯 Features Built

### Invoice Form Modal
**Trigger:** Click "Request Invoice" button in Invoices tab

**Design:** Matching your example structure exactly

### Form Fields:

1. **Sales Order Reference** (Dropdown)
   - Pulls from `ordersList` (backend data)
   - Shows: Order Number — Customer Name — Amount
   - Example: `SO-2025-021 — Ministry of Finance — ETB 1,500,000`
   - Auto-fills subtotal when order selected
   - Optional (can create invoice without order)

2. **Billed Customer** (Read-only)
   - Organization name
   - Email address
   - Phone number
   - Icons for each field

3. **Due Date**
   - Date picker
   - Defaults to 30 days from now

4. **Financial Details** (Green section)
   - **Subtotal (ETB):** Number input, required
   - **VAT Tax Rate (%):** Dropdown
     - 0% - Tax Exempt
     - 15% - Standard VAT ✅ Default
     - 10% - Reduced Rate
   - **Discount (ETB):** Number input, optional

5. **Calculated Totals** (Real-time)
   - Subtotal
   - VAT (calculated automatically)
   - Discount (subtracted)
   - **TOTAL** (bold, large, green)

6. **Invoice Notes & Terms**
   - Textarea for payment terms, account details, project references

7. **Action Buttons**
   - Cancel (gray)
   - Generate Invoice (blue gradient)

---

## 💡 Calculations

### Formula:
```javascript
const subtotal = Number(invoiceForm.subtotal);
const taxRate = Number(invoiceForm.taxRate) / 100; // 15% = 0.15
const discount = Number(invoiceForm.discount);
const taxAmount = subtotal * taxRate;
const totalAmount = subtotal + taxAmount - discount;
```

### Example:
- Subtotal: ETB 1,500,000
- VAT 15%: ETB 225,000
- Discount: ETB 0
- **TOTAL: ETB 1,725,000**

---

## 🎨 Design (Matching ERP)

### Colors:
- **Header:** Text + small subtitle
- **Sales Order Section:** Blue background (`bg-blue-50`, `border-blue-200`)
- **Customer Section:** Gray background (`bg-slate-50`)
- **Financial Section:** Green background (`bg-green-50`, `border-green-200`)
- **Submit Button:** Blue to Indigo gradient

### Structure:
```
┌─────────────────────────────────────────┐
│  Generate Invoice            [X]        │
│  Create invoice request...              │
├─────────────────────────────────────────┤
│  Sales Order Reference      [Dropdown]  │
│  SO-2025-021 — Ministry...              │
├─────────────────────────────────────────┤
│  Billed Customer                        │
│  🏢 Ministry of Finance                 │
│  ✉️ customer@insa.gov.et                │
│  📞 +251 911 000000                     │
├─────────────────────────────────────────┤
│  Due Date                  [Date]       │
├─────────────────────────────────────────┤
│  Financial Details                      │
│  Subtotal (ETB)            [1500000]    │
│  VAT Tax Rate (%)          [15% ▼]      │
│  Discount (ETB)            [0]          │
│  ─────────────────────────────────      │
│  Subtotal:          ETB 1,500,000       │
│  VAT 15%:           ETB 225,000         │
│  Discount:          - ETB 0             │
│  ═════════════════════════════════      │
│  TOTAL:             ETB 1,725,000       │
├─────────────────────────────────────────┤
│  Invoice Notes & Terms                  │
│  [Textarea]                             │
├─────────────────────────────────────────┤
│  [Cancel]    [Generate Invoice]         │
└─────────────────────────────────────────┘
```

---

## 🔌 Backend Integration

### State Management:
```typescript
const [showInvoiceModal, setShowInvoiceModal] = useState(false);
const [invoiceForm, setInvoiceForm] = useState({
  salesOrderId: "",
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  subtotal: "",
  taxRate: "15",
  discount: "0",
  notes: "",
});
```

### Submit Handler:
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Calculate amounts
  const subtotal = Number(invoiceForm.subtotal);
  const taxRate = Number(invoiceForm.taxRate) / 100;
  const discount = Number(invoiceForm.discount);
  const taxAmount = subtotal * taxRate;
  
  // Create invoice
  await invoiceService.createInvoice({
    customerId: customerId,
    salesOrderId: invoiceForm.salesOrderId || undefined,
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: invoiceForm.dueDate,
    subtotal: subtotal,
    taxAmount: taxAmount,
    discountAmount: discount,
    notes: invoiceForm.notes,
  });
  
  // Show success toast
  showToast("Invoice request submitted for approval!");
  
  // Close modal and refresh
  setShowInvoiceModal(false);
  loadAllBackendData();
};
```

### Data Sources:
- **Sales Orders:** From `ordersList` state (fetched from `/api/sales-orders`)
- **Customer Info:** From localStorage/state (`customerName`, `customerEmail`, `customerPhone`, `customerOrg`)
- **Customer ID:** Resolved via `resolveCustomerEntity()` function

---

## 🚀 User Flow

1. Customer clicks "Request Invoice" button
2. Modal opens with form
3. (Optional) Select sales order from dropdown → auto-fills subtotal
4. Enter/verify subtotal amount
5. Select VAT rate (defaults to 15%)
6. (Optional) Enter discount
7. See real-time calculation of total
8. Add payment terms/notes
9. Click "Generate Invoice"
10. Invoice created with status `PENDING_APPROVAL`
11. Finance Officer reviews and approves
12. Status becomes `PAID`

---

## 📋 Form Validation

- **Subtotal:** Required, must be number ≥ 0
- **Due Date:** Required, must be valid date
- **Tax Rate:** Required (dropdown, can't be empty)
- **Discount:** Optional, must be number ≥ 0 if provided
- **Notes:** Optional

---

## 🎯 Next Steps (Optional)

1. Add invoice line items (multiple products)
2. Add file upload for supporting documents
3. Add invoice preview before submission
4. Add PDF generation
5. Add email sending to finance team
6. Add invoice templates
7. Add recurring invoice option
8. Add payment link generation

---

## Status

**Feature:** Complete (implementation ready)  
**Design:** Matches ERP system exactly  
**Backend:** Fully integrated  
**Calculation:** Real-time, accurate  

The invoice form structure, calculations, and backend integration are complete and ready to use!
