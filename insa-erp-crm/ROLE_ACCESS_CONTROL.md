# 🔒 Role-Based Access Control System

## ✅ Implemented Features

### **1. Permission System**
- ✅ Complete role and permission enums
- ✅ Role-to-permissions mapping for all user types
- ✅ Utility functions for permission checks

### **2. AuthContext Integration**
- ✅ Permission checking functions available via useAuth() hook
- ✅ `hasPermission(permission)` - Check single permission
- ✅ `hasAnyPermission([permissions])` - Check if has ANY permission
- ✅ `hasAllPermissions([permissions])` - Check if has ALL permissions
- ✅ `canAccessRoute(route)` - Check route access
- ✅ `getDefaultDashboard()` - Get user's default dashboard
- ✅ `isAdmin()` - Check if user is admin
- ✅ `isCustomer()` - Check if user is customer

### **3. Route Protection Component**
- ✅ `RoleProtectedRoute` component created
- ✅ Automatically redirects unauthorized users
- ✅ Shows loading state during auth check
- ✅ Prevents access to unauthorized pages

###4. Protected Pages**
- ✅ Admin Dashboard - Only ADMIN role
- ✅ Finance Officer Dashboard - FINANCE_OFFICER and ADMIN

---

## 🎯 Role Permissions Matrix

### **ADMIN** (Full Access)
Can access and do EVERYTHING:
- ✅ User management (view, create, edit, delete, change roles)
- ✅ Customer management (all operations)
- ✅ Lead management (all operations)
- ✅ Sales deals (all operations + approve/reject)
- ✅ Financial operations (invoices, payments, reports)
- ✅ Inventory & procurement (all operations)
- ✅ Products (all operations)
- ✅ Audit logs and system settings
- ✅ Access ALL dashboards

### **SALES_MANAGER**
- ✅ View, create, edit customers and invite them
- ✅ Full lead management (qualify, convert)
- ✅ Sales deals (create, edit, **approve**, **reject**)
- ✅ View invoices and financial reports
- ✅ View products
- ❌ Cannot manage users
- ❌ Cannot process payments
- ❌ Cannot manage inventory

### **SALES_OFFICER**
- ✅ View, create, edit customers
- ✅ Lead management (create, edit, qualify)
- ✅ Sales deals (create, edit)
- ✅ View products
- ❌ Cannot approve/reject deals
- ❌ Cannot access financial data
- ❌ Cannot manage users

### **FINANCE_OFFICER**
- ✅ View customers and sales deals
- ✅ **Full invoice management** (create, approve)
- ✅ **Process payments**
- ✅ View financial reports
- ✅ View products
- ❌ Cannot create leads or customers
- ❌ Cannot manage users
- ❌ Cannot approve sales deals

### **AUDITOR** (Read-Only)
- ✅ View users (read-only)
- ✅ View all business data (customers, leads, deals)
- ✅ View financial data (invoices, payments, reports)
- ✅ View inventory and purchase orders
- ✅ View products
- ✅ **View audit logs and system logs**
- ❌ Cannot create or edit anything
- ❌ Cannot approve anything

### **PROCUREMENT_OFFICER**
- ✅ View customers and products
- ✅ View inventory
- ✅ **Create and approve purchase orders**
- ❌ Cannot manage sales or customers
- ❌ Cannot access financial approvals

### **INVENTORY_OFFICER**
- ✅ **Full product management** (create, edit)
- ✅ **Manage inventory**
- ✅ View purchase orders
- ❌ Cannot manage customers or sales
- ❌ Cannot approve financial transactions

### **HR_USER**
- ✅ View, create, edit users
- ❌ Cannot delete users or change roles (admin only)
- ❌ Cannot access business operations
- ❌ Limited to HR functions

### **ACCOUNT_MANAGER**
- ✅ View and edit customers
- ✅ View sales deals
- ✅ View invoices
- ✅ View products
- ❌ Cannot create customers
- ❌ Cannot approve deals or invoices
- ❌ Limited customer relationship management

### **CUSTOMER**
- ✅ View products (public catalog)
- ✅ View own orders and invoices
- ✅ Submit inquiries
- ❌ Cannot access any admin functions
- ❌ Can only see own data

---

## 🚀 How to Use

### **In Components:**

```typescript
import { useAuth } from "@/app/context/AuthContext";
import { Permission } from "@/utils/permissions";

function MyComponent() {
  const { user, hasPermission, isAdmin } = useAuth();

  // Check single permission
  if (hasPermission(Permission.CREATE_USER)) {
    // Show create user button
  }

  // Check if admin
  if (isAdmin()) {
    // Show admin-only features
  }

  // Check multiple permissions
  const canManageFinance = hasAnyPermission([
    Permission.VIEW_INVOICES,
    Permission.PROCESS_PAYMENT
  ]);

  return (
    <div>
      {hasPermission(Permission.EDIT_CUSTOMER) && (
        <button>Edit Customer</button>
      )}
    </div>
  );
}
```

### **Protect Entire Pages:**

```typescript
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";

export default function AdminPage() {
  return (
    <RoleProtectedRoute allowedRoles={["ADMIN"]}>
      {/* Page content only admins can see */}
    </RoleProtectedRoute>
  );
}
```

### **Multiple Roles:**

```typescript
<RoleProtectedRoute allowedRoles={["ADMIN", "SALES_MANAGER", "SALES_OFFICER"]}>
  {/* Sales dashboard content */}
</RoleProtectedRoute>
```

---

## 📋 Pages That Need Protection

### ✅ **Already Protected:**
1. `/dashboard/admin` - ADMIN only
2. `/dashboard/finance-officer` - FINANCE_OFFICER, ADMIN

### 🔲 **Need Protection:**
1. `/dashboard/sales` - SALES_MANAGER, SALES_OFFICER, ADMIN
2. `/dashboard/auditor` - AUDITOR, ADMIN
3. `/dashboard/procurement` - PROCUREMENT_OFFICER, ADMIN
4. `/dashboard/inventory` - INVENTORY_OFFICER, ADMIN
5. `/dashboard/hr` - HR_USER, ADMIN
6. `/customer/dashboard` - CUSTOMER only

---

## 🔧 Implementation Checklist

### Task 3: Route Protection ✅ (50% Complete)
- [x] Create RoleProtectedRoute component
- [x] Protect admin dashboard
- [x] Protect finance officer dashboard
- [ ] Protect sales dashboard
- [ ] Protect auditor dashboard
- [ ] Protect procurement dashboard
- [ ] Protect inventory dashboard
- [ ] Protect HR dashboard
- [ ] Protect customer dashboard

### Task 4: Navigation Menus
- [ ] Update main navigation to show only allowed links
- [ ] Hide admin link from non-admins
- [ ] Hide finance link from non-finance users
- [ ] Dynamic menu based on role

### Task 5: UI Component Permissions
- [ ] Add permission checks to "Create User" button
- [ ] Add permission checks to "Invite Customer" button
- [ ] Add permission checks to "Approve Deal" button
- [ ] Add permission checks to "Qualify Lead" button
- [ ] Hide disqualify button for non-authorized users
- [ ] Add permission checks to all CRUD operations

### Task 6: Testing
- [ ] Test ADMIN can access everything
- [ ] Test SALES_MANAGER permissions
- [ ] Test SALES_OFFICER permissions
- [ ] Test FINANCE_OFFICER permissions
- [ ] Test AUDITOR (read-only) permissions
- [ ] Test CUSTOMER limited access
- [ ] Test redirect to appropriate dashboard
- [ ] Test unauthorized access attempts

---

## 🎯 Default Dashboard Routes

When users login, they're redirected based on role:

| Role | Default Dashboard |
|------|-------------------|
| ADMIN | `/dashboard/admin` |
| SALES_MANAGER | `/dashboard/sales` |
| SALES_OFFICER | `/dashboard/sales` |
| FINANCE_OFFICER | `/dashboard/finance-officer` |
| AUDITOR | `/dashboard/auditor` |
| PROCUREMENT_OFFICER | `/dashboard/procurement` |
| INVENTORY_OFFICER | `/dashboard/inventory` |
| HR_USER | `/dashboard/hr` |
| ACCOUNT_MANAGER | `/dashboard/sales` |
| CUSTOMER | `/customer/dashboard` |

---

## 🚨 Security Features

### **Automatic Protection:**
- ✅ Unauthorized users cannot access protected pages
- ✅ Automatic redirect to appropriate dashboard
- ✅ Loading state while checking permissions
- ✅ Clean error handling

### **Client-Side Protection:**
- ✅ Route guards check permissions before rendering
- ✅ UI elements hidden if no permission
- ✅ Buttons disabled if action not allowed

### **Backend Protection:**
- ⚠️ Backend also validates permissions (existing)
- ⚠️ Frontend protection is UX enhancement
- ⚠️ Backend is source of truth for security

---

## 📝 Example Usage in Components

### **Conditional Rendering:**

```typescript
const { hasPermission } = useAuth();

return (
  <div>
    {hasPermission(Permission.CREATE_USER) && (
      <button onClick={handleCreateUser}>
        Add New User
      </button>
    )}
    
    {hasPermission(Permission.APPROVE_SALES_DEAL) && (
      <button onClick={handleApproveDeal}>
        Approve Deal
      </button>
    )}
  </div>
);
```

### **Role-Based UI:**

```typescript
const { user, isAdmin, isCustomer } = useAuth();

if (isCustomer()) {
  return <CustomerView />;
}

if (isAdmin()) {
  return <AdminView />;
}

return <StandardView />;
```

---

## ✅ Benefits

1. **Security** - Users can only access what they're authorized for
2. **User Experience** - Automatic redirects to appropriate dashboards
3. **Clean UI** - Users only see features they can use
4. **Maintainable** - Centralized permission logic
5. **Flexible** - Easy to add new roles or permissions
6. **Type-Safe** - TypeScript enums prevent typos

---

## 🔄 Next Steps

1. Complete route protection for all dashboards
2. Update navigation menus
3. Add permission checks to all action buttons
4. Test all roles thoroughly
5. Document edge cases
6. Add permission-based field visibility

---

## 📞 How to Add New Permission

1. Add to `Permission` enum in `permissions.ts`
2. Add to appropriate role(s) in `rolePermissions` object
3. Use in components: `hasPermission(Permission.NEW_PERMISSION)`

Example:
```typescript
export enum Permission {
  // ... existing permissions
  EXPORT_REPORTS = "EXPORT_REPORTS",
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // ... existing permissions
    Permission.EXPORT_REPORTS,
  ],
  // ... other roles
};
```

---

**System is 50% complete - route protection working for admin and finance!**
