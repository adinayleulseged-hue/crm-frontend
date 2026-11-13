import { z } from 'zod';

export const opportunitySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  customerId: z.number().int().positive('Customer is required'),
  stage: z.enum(['PROSPECTING', 'QUALIFICATION', 'NEEDS_ANALYSIS', 'VALUE_PROPOSITION', 'DECISION_MAKERS', 'PERCEPTION_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  assignedTo: z.union([z.string(), z.number()]).optional(),
});

export type OpportunityFormValues = z.infer<typeof opportunitySchema>;
