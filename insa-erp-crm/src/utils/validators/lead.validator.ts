import { z } from 'zod';

export const leadSchema = z.object({
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'CONFERENCE', 'OTHER']).optional(),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION']).optional(),
  score: z.number().min(0).max(100).optional(),
  estimatedValue: z.number().positive('Estimated value must be positive').optional(),
  assignedTo: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
