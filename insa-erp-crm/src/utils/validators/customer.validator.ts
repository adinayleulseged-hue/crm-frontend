import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  tin: z.string().regex(/^\d{10}$/, 'TIN must be exactly 10 digits').optional().or(z.literal('')),
  customerType: z.enum(['INDIVIDUAL', 'COMPANY', 'GOVERNMENT', 'NGO']).optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  city: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().positive('Credit limit must be positive').optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
