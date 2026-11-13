import { z } from 'zod';

export const invoiceSchema = z.object({
  customerId: z.number().int().positive('Customer is required'),
  salesOrderId: z.number().int().positive().optional(),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  discountAmount: z.number().nonnegative('Discount cannot be negative').optional().default(0),
  notes: z.string().optional(),
}).refine(data => new Date(data.dueDate) >= new Date(data.invoiceDate), {
  message: "Due date must be after or equal to invoice date",
  path: ["dueDate"]
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
