export interface Lead {
  id: number;
  leadCode?: string;
  // Backend response fields
  firstName?: string;
  lastName?: string;
  company?: string;
  contactName?: string; // alias used in list views
  phone?: string;
  email?: string;
  source?: string;
  stage?: string;
  score?: number;
  estimatedValue?: number;
  budget?: number;
  assignedTo?: string | number;
  notes?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface LeadRequest {
  // Backend LeadCreateDTO required fields
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  company?: string;
  companySize?: string;
  industry?: string;
  jobTitle?: string;
  department?: string;
  preferredContactMethod?: string;
  bestTimeToContact?: string;
  budget?: number;
  authority?: string;
  need?: string;
  timeline?: string;
  assignedTeam?: string;
  campaignId?: number;
  territoryId?: number;
  internalNotes?: string;
  source?: string;         // LeadSource enum: WEBSITE|REFERRAL|COLD_CALL|SOCIAL_MEDIA|EVENT|PARTNER
  sourceDetails?: string;
  assignedTo?: string;
  notes?: string;
  // convenience alias used by create form
  estimatedValue?: number;
  score?: number;
  [key: string]: any;
}

export interface LeadResponse extends Lead {}

export interface LeadFilterParams {
  search?: string;
  stage?: string;
  page?: number;
  size?: number;
}

export interface LeadConvertRequest {
  conversionReason?: string;
  createOpportunity?: boolean;  // default true in backend
  opportunityValue?: number;
  opportunityTitle?: string;
}
