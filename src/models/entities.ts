import { OrderId, CustomerId } from './types';

/**
 * Domain entities with strong typing
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  orderId: OrderId;
  customerId: CustomerId;
  customerEmail: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: Address;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  version: number; // For optimistic locking
  [key: string]: unknown; // Index signature for DynamoDB compatibility
}

// Generic repository interface with advanced types
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(params?: QueryParams): Promise<PaginatedResult<T>>;
  save(entity: T): Promise<T>;
  update(id: ID, updates: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

export interface QueryParams {
  limit?: number;
  nextToken?: string;
  filters?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  items: T[];
  nextToken?: string;
  count: number;
}

// Generic service interface with constraints
export interface Service<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

// Builder pattern for Order
export class OrderBuilder {
  private order: Partial<Order> = {
    version: 1,
  };

  withOrderId(orderId: OrderId): this {
    this.order.orderId = orderId;
    return this;
  }

  withCustomerId(customerId: CustomerId): this {
    this.order.customerId = customerId;
    return this;
  }

  withCustomerEmail(email: string): this {
    this.order.customerEmail = email;
    return this;
  }

  withItems(items: Order['items']): this {
    this.order.items = items;
    this.order.totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return this;
  }

  withStatus(status: OrderStatus): this {
    this.order.status = status;
    return this;
  }

  withShippingAddress(address: Address): this {
    this.order.shippingAddress = address;
    return this;
  }

  withMetadata(metadata?: Record<string, string>): this {
    if (metadata !== null && metadata !== undefined) {
      this.order.metadata = metadata;
    }
    return this;
  }

  build(): Order {
    const now = new Date().toISOString();

    if (
      this.order.orderId === null ||
      this.order.orderId === undefined ||
      this.order.orderId === ''
    )
      throw new Error('Order ID is required');
    if (
      this.order.customerId === null ||
      this.order.customerId === undefined ||
      this.order.customerId === ''
    )
      throw new Error('Customer ID is required');
    if (
      this.order.customerEmail === null ||
      this.order.customerEmail === undefined ||
      this.order.customerEmail === ''
    )
      throw new Error('Customer email is required');
    if (!this.order.items || this.order.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    if (!this.order.shippingAddress) throw new Error('Shipping address is required');

    return {
      ...this.order,
      status: this.order.status ?? OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      version: 1,
    } as Order;
  }
}
