import { Order, OrderBuilder, OrderStatus } from '../models/entities';
import { OrderId, CustomerId } from '../models/types';
import { CreateOrderRequest, UpdateOrderRequest } from '../models/schemas';
import { DynamoDBRepository } from '../utils/dynamodb-repository';
import { EventPublisher } from './event-publisher';
import { createLogger, getEnvVar, generateId } from '../utils/helpers';

/**
 * Order service with business logic and event publishing
 */
export class OrderService {
  private readonly repository: DynamoDBRepository<Order, OrderId>;
  private readonly eventPublisher: EventPublisher;
  private readonly logger = createLogger('OrderService');

  constructor(repository?: DynamoDBRepository<Order, OrderId>, eventPublisher?: EventPublisher) {
    const tableName = getEnvVar('ORDERS_TABLE_NAME', 'Orders');
    this.repository = repository ?? new DynamoDBRepository<Order, OrderId>(tableName, 'orderId');
    this.eventPublisher = eventPublisher ?? new EventPublisher();
  }

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    this.logger.info('Creating new order', { customerId: request.customerId });

    try {
      // Build order using builder pattern
      const order = new OrderBuilder()
        .withOrderId(generateId() as OrderId)
        .withCustomerId(request.customerId)
        .withCustomerEmail(request.customerEmail)
        .withItems(request.items)
        .withShippingAddress(request.shippingAddress)
        .withMetadata(request.metadata)
        .build();

      // Save to repository
      const savedOrder = await this.repository.save(order);

      // Publish event
      await this.eventPublisher.publish({
        type: 'ORDER_CREATED',
        payload: {
          orderId: savedOrder.orderId,
          customerId: savedOrder.customerId,
          items: savedOrder.items,
          totalAmount: savedOrder.totalAmount,
          createdAt: savedOrder.createdAt,
        },
      });

      this.logger.info('Order created successfully', { orderId: order.orderId });
      return savedOrder;
    } catch (error) {
      this.logger.error('Error creating order', error);
      throw error;
    }
  }

  async getOrder(orderId: OrderId): Promise<Order | null> {
    this.logger.info('Getting order', { orderId });

    try {
      const order = await this.repository.findById(orderId);

      if (!order) {
        this.logger.info('Order not found', { orderId });
      }

      return order;
    } catch (error) {
      this.logger.error('Error getting order', error, { orderId });
      throw error;
    }
  }

  async updateOrder(request: UpdateOrderRequest): Promise<Order> {
    this.logger.info('Updating order', { orderId: request.orderId });

    try {
      // Get existing order
      const existingOrder = await this.repository.findById(request.orderId);

      if (!existingOrder) {
        throw new Error(`Order not found: ${request.orderId}`);
      }

      // Build updates
      const updates: Partial<Order> = {
        updatedAt: new Date().toISOString(),
        version: existingOrder.version + 1,
        ...(request.items && {
          items: request.items,
          totalAmount: request.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
        ...(request.status && { status: request.status as OrderStatus }),
        ...(request.shippingAddress && { shippingAddress: request.shippingAddress }),
      };

      // Update in repository
      const updatedOrder = await this.repository.update(request.orderId, updates);

      // Publish event
      await this.eventPublisher.publish({
        type: 'ORDER_UPDATED',
        payload: {
          orderId: updatedOrder.orderId,
          updates,
          updatedAt: updatedOrder.updatedAt,
        },
      });

      this.logger.info('Order updated successfully', { orderId: request.orderId });
      return updatedOrder;
    } catch (error) {
      this.logger.error('Error updating order', error, { orderId: request.orderId });
      throw error;
    }
  }

  async deleteOrder(orderId: OrderId, reason?: string): Promise<void> {
    this.logger.info('Deleting order', { orderId });

    try {
      // Verify order exists
      const existingOrder = await this.repository.findById(orderId);

      if (!existingOrder) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Delete from repository
      await this.repository.delete(orderId);

      // Publish event
      await this.eventPublisher.publish({
        type: 'ORDER_DELETED',
        payload: {
          orderId,
          deletedAt: new Date().toISOString(),
          reason,
        },
      });

      this.logger.info('Order deleted successfully', { orderId });
    } catch (error) {
      this.logger.error('Error deleting order', error, { orderId });
      throw error;
    }
  }

  async listOrders(
    customerId?: CustomerId,
    limit = 20,
    nextToken?: string
  ): Promise<{
    orders: Order[];
    nextToken?: string;
  }> {
    this.logger.info('Listing orders', { customerId, limit });

    try {
      let result;

      if (customerId) {
        // Query by customer ID using GSI
        result = await this.repository.queryByIndex(
          'CustomerIdIndex',
          'customerId = :customerId',
          { ':customerId': customerId },
          { limit, nextToken }
        );
      } else {
        // Scan all orders
        result = await this.repository.findAll({ limit, nextToken });
      }

      return {
        orders: result.items,
        nextToken: result.nextToken,
      };
    } catch (error) {
      this.logger.error('Error listing orders', error);
      throw error;
    }
  }
}
