import { z } from 'zod';

export const paymentSchema = z.object({
  invoiceId: z.number().int().positive('Invoice is required'),
  customerId: z.number().int().positive('Customer is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_MONEY', 'ONLINE_PAYMENT']),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  transactionReference: z.string().optional(),
  receivedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
