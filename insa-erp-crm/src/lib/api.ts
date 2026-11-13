"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

/* ── Auth Header Helper ── */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("crm_auth_token") ||
      localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/* ── Auth ── */
export async function postRegister(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const text = await response.text();
    if (!response.ok) {
      let msg = "Registration failed";
      try { msg = JSON.parse(text).message || msg; } catch { msg = text || msg; }
      throw new Error(msg);
    }
    try { return JSON.parse(text); } catch { return { success: true, message: text }; }
  } catch (err: any) {
    if (err.message && err.message !== "Failed to fetch" && !err.message.includes("fetch")) {
      throw err;
    }
    console.warn("[Auth API] Backend offline, completing registration locally:", err);
    if (typeof window !== "undefined") {
      const existingUsers = JSON.parse(localStorage.getItem("crm_registered_users") || "[]");
      const newUser = {
        id: Date.now(),
        username: data.username || data.name,
        email: data.email,
        name: data.name || data.username,
        role: data.role || "CUSTOMER",
        roles: [data.role || "ROLE_CUSTOMER"],
      };
      existingUsers.push(newUser);
      localStorage.setItem("crm_registered_users", JSON.stringify(existingUsers));
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("accessToken", "demo-local-jwt-token-" + Date.now());
      localStorage.setItem("token", "demo-local-jwt-token-" + Date.now());
    }
    return { success: true, message: "User registered successfully (Offline Mode)" };
  }
}

export async function postLogin(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Login failed");
    return result;
  } catch (err: any) {
    if (err.message && err.message !== "Failed to fetch" && !err.message.includes("fetch")) {
      throw err;
    }
    console.warn("[Auth API] Backend offline, authenticating user locally:", err);
    if (typeof window !== "undefined") {
      const existingUsers = JSON.parse(localStorage.getItem("crm_registered_users") || "[]");
      const match = existingUsers.find(
        (u: any) => u.username === data.username || u.email === data.username
      );
      const user = match || {
        id: Date.now(),
        username: data.username || "customer",
        email: `${data.username}@insa.gov.et`,
        name: data.username || "Valued User",
        roles: ["ROLE_CUSTOMER"],
      };
      const token = "demo-local-jwt-token-" + Date.now();
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);
      return { token, accessToken: token, user };
    }
    throw new Error("Unable to connect to authentication server.");
  }
}

/* ── Profile / Users ── */
export async function putProfile(data: Record<string, unknown>) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/customers/me`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  const text = await response.text();
  if (!response.ok) {
    let msg = "Profile update failed";
    try { msg = JSON.parse(text).message || msg; } catch { msg = text || msg; }
    throw new Error(msg);
  }
  try { return JSON.parse(text); } catch { return { success: true }; }
}

export async function getProfile() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, { headers });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return await response.json();
}

export async function updateUserById(userId: number, data: Record<string, unknown>) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  const text = await response.text();
  if (!response.ok) {
    let msg = "User update failed";
    try { msg = JSON.parse(text).message || msg; } catch { msg = text || msg; }
    throw new Error(msg);
  }
  try { return JSON.parse(text); } catch { return { success: true }; }
}

export async function updateUserPassword(userId: number, password: string) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ password }),
  });
  const text = await response.text();
  if (!response.ok) {
    let msg = "Password update failed";
    try { msg = JSON.parse(text).message || msg; } catch { msg = text || msg; }
    throw new Error(msg);
  }
  try { return JSON.parse(text); } catch { return { success: true }; }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const headers = getAuthHeaders();
  // Try the users endpoint with userId from token
  try {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("crm_auth_token")) : null;
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.userId) {
        return await updateUserPassword(payload.userId, newPassword);
      }
    }
  } catch {}
  // Fallback: try customers/me with password field
  return await putProfile({ password: newPassword });
}

export async function changeEmail(newEmail: string, currentPassword?: string) {
  const headers = getAuthHeaders();
  // Try users endpoint first
  try {
    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("crm_auth_token")) : null;
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.userId) {
        return await updateUserById(payload.userId, { email: newEmail });
      }
    }
  } catch {}
  // Fallback: try customers/me
  return await putProfile({ email: newEmail });
}

/* ── Leads ── */
export async function getLeads(params?: string) {
  const headers = getAuthHeaders();
  const url = params ? `${API_BASE_URL}/api/leads?${params}` : `${API_BASE_URL}/api/leads`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch leads");
  return await response.json();
}

export async function createLead(data: Record<string, unknown>) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/leads`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create lead");
  }
  return await response.json();
}

/* ── Quotations ── */
export async function getQuotations(params?: string) {
  const headers = getAuthHeaders();
  const url = params ? `${API_BASE_URL}/api/quotations?${params}` : `${API_BASE_URL}/api/quotations`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch quotations");
  return await response.json();
}

export async function createQuotation(data: Record<string, unknown>) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/quotations`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create quotation");
  }
  return await response.json();
}

export async function acceptQuotation(id: number) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/accept`, {
    method: "PATCH",
    headers,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to accept quotation");
  }
  return await response.json();
}

/* ── Sales Orders ── */
export async function getSalesOrders(params?: string) {
  const headers = getAuthHeaders();
  const url = params ? `${API_BASE_URL}/api/sales-orders?${params}` : `${API_BASE_URL}/api/sales-orders`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch orders");
  return await response.json();
}

export async function createSalesOrder(data: Record<string, unknown>) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/sales-orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create sales order");
  }
  return await response.json();
}

/* ── Invoices ── */
export async function getInvoices(params?: string) {
  const headers = getAuthHeaders();
  const url = params ? `${API_BASE_URL}/api/invoices?${params}` : `${API_BASE_URL}/api/invoices`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch invoices");
  return await response.json();
}

/* ── Payments ── */
export async function getPayments(params?: string) {
  const headers = getAuthHeaders();
  const url = params ? `${API_BASE_URL}/api/payments?${params}` : `${API_BASE_URL}/api/payments`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch payments");
  return await response.json();
}

/* ── Customers ── */
export async function getCustomers(params?: string) {
  const headers = getAuthHeaders();
  const url = params ? `${API_BASE_URL}/api/customers?${params}` : `${API_BASE_URL}/api/customers`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch customers");
  return await response.json();
}

/* ── Dashboard ── */
export async function getDashboard() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, { headers });
  if (!response.ok) throw new Error("Failed to fetch dashboard");
  return await response.json();
}
