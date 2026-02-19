/**
 * Advanced TypeScript type utilities demonstrating deep type system expertise
 */

// Conditional types for API responses
export type ApiResponse<T, E = Error> =
  | { success: true; data: T; metadata?: ResponseMetadata }
  | { success: false; error: E; code: ErrorCode };

// Mapped type for making properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Recursive type for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Type guard helper
export type TypeGuard<T> = (value: unknown) => value is T;

// Extract promise type
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// Function overload types
export type AsyncFunction<TArgs extends unknown[], TReturn> = (...args: TArgs) => Promise<TReturn>;

// Discriminated union for event types
export type DomainEvent =
  | { type: 'ORDER_CREATED'; payload: OrderCreatedPayload }
  | { type: 'ORDER_UPDATED'; payload: OrderUpdatedPayload }
  | { type: 'ORDER_DELETED'; payload: OrderDeletedPayload }
  | { type: 'PAYMENT_PROCESSED'; payload: PaymentProcessedPayload };

// Extract event type by discriminant
export type ExtractEvent<T extends DomainEvent['type']> = Extract<DomainEvent, { type: T }>;

// Branded types for type safety
export type Brand<K, T> = K & { __brand: T };
export type OrderId = Brand<string, 'OrderId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type Email = Brand<string, 'Email'>;

// Readonly deep type
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Error codes enum
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

// Response metadata
export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
}

// Event payloads
export interface OrderCreatedPayload {
  orderId: OrderId;
  customerId: CustomerId;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export interface OrderUpdatedPayload {
  orderId: OrderId;
  updates: Partial<OrderCreatedPayload>;
  updatedAt: string;
}

export interface OrderDeletedPayload {
  orderId: OrderId;
  deletedAt: string;
  reason?: string;
}

export interface PaymentProcessedPayload {
  orderId: OrderId;
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  processedAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
