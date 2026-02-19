import { z } from 'zod';
import { OrderId, CustomerId, Email } from './types';

/**
 * Zod schemas for runtime validation with TypeScript type inference
 */

// Email validation with branded type
export const emailSchema = z
  .string()
  .email()
  .transform((val) => val as Email);

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

// Create order request schema
export const createOrderSchema = z.object({
  customerId: z
    .string()
    .min(1)
    .transform((val) => val as CustomerId),
  customerEmail: emailSchema,
  items: z.array(orderItemSchema).min(1),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2).max(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().default('US'),
  }),
  metadata: z.record(z.string()).optional(),
});

// Update order schema
export const updateOrderSchema = z.object({
  orderId: z
    .string()
    .min(1)
    .transform((val) => val as OrderId),
  items: z.array(orderItemSchema).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  shippingAddress: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(2).max(2),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
      country: z.string(),
    })
    .optional(),
});

// Query parameters schema
export const queryOrdersSchema = z.object({
  customerId: z
    .string()
    .optional()
    .transform((val) =>
      val !== null && val !== undefined && val !== '' ? (val as CustomerId) : undefined
    ),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  nextToken: z.string().optional(),
});

// Event schema
export const eventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('ORDER_CREATED'),
    payload: z.object({
      orderId: z.string(),
      customerId: z.string(),
      items: z.array(orderItemSchema),
      totalAmount: z.number().positive(),
      createdAt: z.string().datetime(),
    }),
  }),
  z.object({
    type: z.literal('ORDER_UPDATED'),
    payload: z.object({
      orderId: z.string(),
      updates: z.record(z.unknown()),
      updatedAt: z.string().datetime(),
    }),
  }),
  z.object({
    type: z.literal('ORDER_DELETED'),
    payload: z.object({
      orderId: z.string(),
      deletedAt: z.string().datetime(),
      reason: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('PAYMENT_PROCESSED'),
    payload: z.object({
      orderId: z.string(),
      paymentId: z.string(),
      amount: z.number().positive(),
      status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
      processedAt: z.string().datetime(),
    }),
  }),
]);

// Infer TypeScript types from Zod schemas
export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
export type UpdateOrderRequest = z.infer<typeof updateOrderSchema>;
export type QueryOrdersParams = z.infer<typeof queryOrdersSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
