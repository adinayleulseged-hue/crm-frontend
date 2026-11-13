// Role-based access control utilities

export enum Role {
  ADMIN = "ADMIN",
  SALES_MANAGER = "SALES_MANAGER",
  SALES_OFFICER = "SALES_OFFICER",
  AUDITOR = "AUDITOR",
  FINANCE_OFFICER = "FINANCE_OFFICER",
  PROCUREMENT_OFFICER = "PROCUREMENT_OFFICER",
  INVENTORY_OFFICER = "INVENTORY_OFFICER",
  HR_USER = "HR_USER",
  ACCOUNT_MANAGER = "ACCOUNT_MANAGER",
  CUSTOMER = "CUSTOMER",
}

export enum Permission {
  // User Management
  VIEW_USERS = "VIEW_USERS",
  CREATE_USER = "CREATE_USER",
  EDIT_USER = "EDIT_USER",
  DELETE_USER = "DELETE_USER",
  CHANGE_USER_ROLE = "CHANGE_USER_ROLE",
  
  // Customer Management
  VIEW_CUSTOMERS = "VIEW_CUSTOMERS",
  CREATE_CUSTOMER = "CREATE_CUSTOMER",
  EDIT_CUSTOMER = "EDIT_CUSTOMER",
  DELETE_CUSTOMER = "DELETE_CUSTOMER",
  INVITE_CUSTOMER = "INVITE_CUSTOMER",
  
  // Lead Management
  VIEW_LEADS = "VIEW_LEADS",
  CREATE_LEAD = "CREATE_LEAD",
  EDIT_LEAD = "EDIT_LEAD",
  DELETE_LEAD = "DELETE_LEAD",
  QUALIFY_LEAD = "QUALIFY_LEAD",
  CONVERT_LEAD = "CONVERT_LEAD",
  
  // Sales & Opportunities
  VIEW_SALES_DEALS = "VIEW_SALES_DEALS",
  CREATE_SALES_DEAL = "CREATE_SALES_DEAL",
  EDIT_SALES_DEAL = "EDIT_SALES_DEAL",
  DELETE_SALES_DEAL = "DELETE_SALES_DEAL",
  APPROVE_SALES_DEAL = "APPROVE_SALES_DEAL",
  REJECT_SALES_DEAL = "REJECT_SALES_DEAL",
  
  // Financial
  VIEW_INVOICES = "VIEW_INVOICES",
  CREATE_INVOICE = "CREATE_INVOICE",
  APPROVE_INVOICE = "APPROVE_INVOICE",
  VIEW_PAYMENTS = "VIEW_PAYMENTS",
  PROCESS_PAYMENT = "PROCESS_PAYMENT",
  VIEW_FINANCIAL_REPORTS = "VIEW_FINANCIAL_REPORTS",
  
  // Inventory & Procurement
  VIEW_INVENTORY = "VIEW_INVENTORY",
  MANAGE_INVENTORY = "MANAGE_INVENTORY",
  VIEW_PURCHASE_ORDERS = "VIEW_PURCHASE_ORDERS",
  CREATE_PURCHASE_ORDER = "CREATE_PURCHASE_ORDER",
  APPROVE_PURCHASE_ORDER = "APPROVE_PURCHASE_ORDER",
  
  // Products
  VIEW_PRODUCTS = "VIEW_PRODUCTS",
  CREATE_PRODUCT = "CREATE_PRODUCT",
  EDIT_PRODUCT = "EDIT_PRODUCT",
  DELETE_PRODUCT = "DELETE_PRODUCT",
  
  // Audit & Logs
  VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS",
  VIEW_SYSTEM_LOGS = "VIEW_SYSTEM_LOGS",
  
  // System Administration
  VIEW_SYSTEM_SETTINGS = "VIEW_SYSTEM_SETTINGS",
  EDIT_SYSTEM_SETTINGS = "EDIT_SYSTEM_SETTINGS",
  VIEW_SERVICES_STATUS = "VIEW_SERVICES_STATUS",
}

// Role to Permissions mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Full access to everything
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.CHANGE_USER_ROLE,
    Permission.VIEW_CUSTOMERS,
    Permission.CREATE_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.DELETE_CUSTOMER,
    Permission.INVITE_CUSTOMER,
    Permission.VIEW_LEADS,
    Permission.CREATE_LEAD,
    Permission.EDIT_LEAD,
    Permission.DELETE_LEAD,
    Permission.QUALIFY_LEAD,
    Permission.CONVERT_LEAD,
    Permission.VIEW_SALES_DEALS,
    Permission.CREATE_SALES_DEAL,
    Permission.EDIT_SALES_DEAL,
    Permission.DELETE_SALES_DEAL,
    Permission.APPROVE_SALES_DEAL,
    Permission.REJECT_SALES_DEAL,
    Permission.VIEW_INVOICES,
    Permission.CREATE_INVOICE,
    Permission.APPROVE_INVOICE,
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_PAYMENT,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_PURCHASE_ORDERS,
    Permission.CREATE_PURCHASE_ORDER,
    Permission.APPROVE_PURCHASE_ORDER,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.EDIT_SYSTEM_SETTINGS,
    Permission.VIEW_SERVICES_STATUS,
  ],

  [Role.SALES_MANAGER]: [
    Permission.VIEW_CUSTOMERS,
    Permission.CREATE_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.INVITE_CUSTOMER,
    Permission.VIEW_LEADS,
    Permission.CREATE_LEAD,
    Permission.EDIT_LEAD,
    Permission.QUALIFY_LEAD,
    Permission.CONVERT_LEAD,
    Permission.VIEW_SALES_DEALS,
    Permission.CREATE_SALES_DEAL,
    Permission.EDIT_SALES_DEAL,
    Permission.APPROVE_SALES_DEAL,
    Permission.REJECT_SALES_DEAL,
    Permission.VIEW_INVOICES,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_FINANCIAL_REPORTS,
  ],

  [Role.SALES_OFFICER]: [
    Permission.VIEW_CUSTOMERS,
    Permission.CREATE_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.VIEW_LEADS,
    Permission.CREATE_LEAD,
    Permission.EDIT_LEAD,
    Permission.QUALIFY_LEAD,
    Permission.VIEW_SALES_DEALS,
    Permission.CREATE_SALES_DEAL,
    Permission.EDIT_SALES_DEAL,
    Permission.VIEW_PRODUCTS,
  ],

  [Role.FINANCE_OFFICER]: [
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_SALES_DEALS,
    Permission.VIEW_INVOICES,
    Permission.CREATE_INVOICE,
    Permission.APPROVE_INVOICE,
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_PAYMENT,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_PRODUCTS,
  ],

  [Role.AUDITOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_LEADS,
    Permission.VIEW_SALES_DEALS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_PURCHASE_ORDERS,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_SYSTEM_LOGS,
  ],

  [Role.PROCUREMENT_OFFICER]: [
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_PURCHASE_ORDERS,
    Permission.CREATE_PURCHASE_ORDER,
    Permission.APPROVE_PURCHASE_ORDER,
  ],

  [Role.INVENTORY_OFFICER]: [
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCT,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_PURCHASE_ORDERS,
  ],

  [Role.HR_USER]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
  ],

  [Role.ACCOUNT_MANAGER]: [
    Permission.VIEW_CUSTOMERS,
    Permission.EDIT_CUSTOMER,
    Permission.VIEW_SALES_DEALS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_PRODUCTS,
  ],

  [Role.CUSTOMER]: [
    // Customers can only view their own data
    Permission.VIEW_PRODUCTS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  
  const normalizedRole = role.toUpperCase() as Role;
  const permissions = rolePermissions[normalizedRole];
  
  if (!permissions) return false;
  
  return permissions.includes(permission);
}

/**
 * Check if a role has ANY of the given permissions
 */
export function hasAnyPermission(role: string | undefined, permissions: Permission[]): boolean {
  if (!role || !permissions || permissions.length === 0) return false;
  
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has ALL of the given permissions
 */
export function hasAllPermissions(role: string | undefined, permissions: Permission[]): boolean {
  if (!role || !permissions || permissions.length === 0) return false;
  
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string | undefined): Permission[] {
  if (!role) return [];
  
  const normalizedRole = role.toUpperCase() as Role;
  return rolePermissions[normalizedRole] || [];
}

/**
 * Check if user can access a specific dashboard route
 */
export function canAccessRoute(role: string | undefined, route: string): boolean {
  if (!role) return false;
  
  const normalizedRole = role.toUpperCase().trim();
  
  // Admin / Super User can access everything
  if (normalizedRole === Role.ADMIN || normalizedRole.includes("ADMIN") || normalizedRole.includes("SUPER") || normalizedRole.includes("ROOT")) {
    return true;
  }
  
  // Route-specific access checks
  if (route.includes('/admin')) {
    return normalizedRole === Role.ADMIN || normalizedRole.includes("ADMIN") || normalizedRole.includes("SUPER");
  }
  
  if (route.includes('/sales')) {
    return [Role.SALES_MANAGER, Role.SALES_OFFICER, Role.ADMIN].includes(normalizedRole as Role) || normalizedRole.includes("SALES");
  }
  
  if (route.includes('/finance')) {
    return [Role.FINANCE_OFFICER, Role.ADMIN].includes(normalizedRole as Role) || normalizedRole.includes("FINANCE") || normalizedRole.includes("FMS");
  }
  
  if (route.includes('/auditor')) {
    return [Role.AUDITOR, Role.ADMIN].includes(normalizedRole as Role) || normalizedRole.includes("AUDITOR");
  }
  
  if (route.includes('/procurement')) {
    return [Role.PROCUREMENT_OFFICER, Role.ADMIN].includes(normalizedRole as Role) || normalizedRole.includes("PROCUREMENT");
  }
  
  if (route.includes('/inventory')) {
    return [Role.INVENTORY_OFFICER, Role.ADMIN].includes(normalizedRole as Role) || normalizedRole.includes("INVENTORY");
  }
  
  if (route.includes('/hr')) {
    return [Role.HR_USER, Role.ADMIN].includes(normalizedRole as Role) || normalizedRole.includes("HR");
  }
  
  if (route.includes('/customer')) {
    return normalizedRole === Role.CUSTOMER || normalizedRole.includes("CUSTOMER") || normalizedRole.includes("CLIENT");
  }
  
  // Default dashboard access for all authenticated users
  if (route === '/dashboard') {
    return true;
  }
  
  return false;
}

/**
 * Get the default dashboard route for a user's role
 */
export function getDefaultDashboard(role: string | undefined): string {
  if (!role) return "/login";
  
  const normalizedRole = role.toUpperCase().trim();
  
  if (normalizedRole === Role.ADMIN || normalizedRole.includes("ADMIN") || normalizedRole.includes("SUPER")) {
    return "/dashboard/admin";
  }
  if (normalizedRole === Role.SALES_MANAGER || normalizedRole.includes("SALES_MANAGER") || normalizedRole.includes("SALES MANAGER")) {
    return "/dashboard/sales-manager";
  }
  if (normalizedRole === Role.SALES_OFFICER || normalizedRole.includes("SALES") || normalizedRole.includes("OFFICER") || normalizedRole.includes("REP")) {
    return "/dashboard/sales-officer";
  }
  if (normalizedRole === Role.FINANCE_OFFICER || normalizedRole.includes("FINANCE") || normalizedRole.includes("FMS")) {
    return "/dashboard/finance-officer";
  }
  if (normalizedRole === Role.AUDITOR || normalizedRole.includes("AUDITOR")) {
    return "/dashboard/auditor";
  }
  if (normalizedRole === Role.CUSTOMER || normalizedRole.includes("CUSTOMER") || normalizedRole.includes("CLIENT")) {
    return "/customer/dashboard";
  }
  
  return "/dashboard/admin";
}

/**
 * Check if role is admin
 */
export function isAdmin(role: string | undefined): boolean {
  if (!role) return false;
  const r = role.toUpperCase().trim();
  return r === Role.ADMIN || r.includes("ADMIN") || r.includes("SUPER") || r.includes("ROOT");
}

/**
 * Check if role is customer
 */
export function isCustomer(role: string | undefined): boolean {
  if (!role) return false;
  const r = role.toUpperCase().trim();
  return r === Role.CUSTOMER || r.includes("CUSTOMER") || r.includes("CLIENT");
}
