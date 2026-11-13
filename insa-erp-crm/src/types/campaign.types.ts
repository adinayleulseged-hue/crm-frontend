export interface Campaign {
  id: number;
  // Backend response uses campaignName
  campaignName?: string;
  name?: string; // alias
  campaignType?: string;
  type?: string; // alias
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  expectedRevenue?: number;
  expectedLeads?: number;
  targetAudience?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignRequest {
  // Backend CampaignCreateDTO fields
  campaignName?: string;  // @NotBlank
  name?: string;          // alias accepted via 'as any'
  description?: string;
  campaignType?: string;  // @NotNull — EMAIL|SMS|SOCIAL_MEDIA|SEMINAR|WEBINAR|CONFERENCE|WEBSITE|REFERRAL|ADVERTISEMENT|OTHER
  type?: string;          // alias
  budget?: number;
  startDate?: string;
  endDate?: string;
  expectedRevenue?: number;
  expectedLeads?: number;
  targetAudience?: string;
  notes?: string;
}

export interface CampaignResponse extends Campaign {}

export interface CampaignFilterParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}
