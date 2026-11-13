import { z } from 'zod';

export const orderItemSchema = z.object({
  itemDescription: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const orderSchema = z.object({
  customerId: z.number().int().positive('Customer is required'),
  quotationRef: z.string().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
}).refine(data => new Date(data.deliveryDate) >= new Date(data.orderDate), {
  message: "Delivery date must be after or equal to order date",
  path: ["deliveryDate"]
});

export type OrderFormValues = z.infer<typeof orderSchema>;
