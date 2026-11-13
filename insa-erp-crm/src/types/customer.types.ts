export interface Customer {
  id: number;
  customerNumber?: string;
  customerName?: string;      // maps to contactName on backend
  organizationName?: string;  // maps to companyName on backend
  customerType?: string;
  email?: string;
  phone?: string;
  address?: string;           // maps to addressLine1 on backend
  city?: string;
  country?: string;
  postalCode?: string;
  industry?: string;
  website?: string;
  description?: string;
  territoryId?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // legacy aliases (kept for backwards compat with list views)
  name?: string;
  contactPerson?: string;
  tin?: string;
  creditLimit?: number;
  outstandingBalance?: number;
}

export interface CustomerRequest {
  // Backend-required fields (CustomerCreateDTO)
  customerName: string;       // @NotBlank — contact person name
  organizationName: string;   // @NotBlank — company/org name
  customerType: string;       // @NotNull — GOVERNMENT|INDIVIDUAL|PRIVATE|ORGANIZATION|NGO|INTERNATIONAL
  email: string;              // @NotBlank @Email
  phone: string;              // @NotBlank
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  industry?: string;
  website?: string;
  description?: string;
  territoryId?: number;
  [key: string]: any;
}

export interface CustomerResponse extends Customer {}

export interface CustomerFilterParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  size?: number;
}
