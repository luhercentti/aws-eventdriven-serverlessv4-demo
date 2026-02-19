import { OrderService } from '../../src/services/order-service';
import { DynamoDBRepository } from '../../src/utils/dynamodb-repository';
import { EventPublisher } from '../../src/services/event-publisher';
import { Order, OrderStatus, OrderBuilder } from '../../src/models/entities';
import { OrderId, CustomerId } from '../../src/models/types';
import { CreateOrderRequest } from '../../src/models/schemas';

// Mock dependencies
jest.mock('../../src/utils/dynamodb-repository');
jest.mock('../../src/services/event-publisher');

describe('OrderService', () => {
  let orderService: OrderService;
  let mockRepository: jest.Mocked<DynamoDBRepository<Order, OrderId>>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(() => {
    mockRepository = new DynamoDBRepository<Order, OrderId>('test-table', 'orderId') as jest.Mocked<DynamoDBRepository<Order, OrderId>>;
    mockEventPublisher = new EventPublisher() as jest.Mocked<EventPublisher>;
    orderService = new OrderService(mockRepository, mockEventPublisher);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const request: CreateOrderRequest = {
        customerId: 'customer-123' as CustomerId,
        customerEmail: 'test@example.com' as never,
        items: [
          {
            productId: 'prod-1',
            name: 'Test Product',
            quantity: 2,
            price: 29.99,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'US',
        },
      };

      const mockOrder: Order = new OrderBuilder()
        .withOrderId('order-123' as OrderId)
        .withCustomerId(request.customerId)
        .withCustomerEmail(request.customerEmail)
        .withItems(request.items)
        .withShippingAddress(request.shippingAddress)
        .build();

      mockRepository.save.mockResolvedValue(mockOrder);
      mockEventPublisher.publish.mockResolvedValue();

      const result = await orderService.createOrder(request);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        customerId: request.customerId,
        customerEmail: request.customerEmail,
      }));
      expect(mockEventPublisher.publish).toHaveBeenCalledWith({
        type: 'ORDER_CREATED',
        payload: expect.objectContaining({
          customerId: mockOrder.customerId,
          totalAmount: mockOrder.totalAmount,
        }),
      });
    });

    it('should calculate total amount correctly', async () => {
      const request: CreateOrderRequest = {
        customerId: 'customer-123' as CustomerId,
        customerEmail: 'test@example.com' as never,
        items: [
          { productId: 'prod-1', name: 'Product 1', quantity: 2, price: 10.00 },
          { productId: 'prod-2', name: 'Product 2', quantity: 1, price: 15.00 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'US',
        },
      };

      mockRepository.save.mockImplementation(async (order) => order);
      mockEventPublisher.publish.mockResolvedValue();

      const result = await orderService.createOrder(request);

      expect(result.totalAmount).toBe(35.00);
    });
  });

  describe('getOrder', () => {
    it('should return an order when it exists', async () => {
      const orderId = 'order-123' as OrderId;
      const mockOrder: Order = new OrderBuilder()
        .withOrderId(orderId)
        .withCustomerId('customer-123' as CustomerId)
        .withCustomerEmail('test@example.com')
        .withItems([{ productId: 'prod-1', name: 'Product', quantity: 1, price: 10 }])
        .withShippingAddress({
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'US',
        })
        .build();

      mockRepository.findById.mockResolvedValue(mockOrder);

      const result = await orderService.getOrder(orderId);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.findById).toHaveBeenCalledWith(orderId);
    });

    it('should return null when order does not exist', async () => {
      const orderId = 'non-existent' as OrderId;
      mockRepository.findById.mockResolvedValue(null);

      const result = await orderService.getOrder(orderId);

      expect(result).toBeNull();
    });
  });

  describe('updateOrder', () => {
    it('should update an order successfully', async () => {
      const orderId = 'order-123' as OrderId;
      const existingOrder: Order = new OrderBuilder()
        .withOrderId(orderId)
        .withCustomerId('customer-123' as CustomerId)
        .withCustomerEmail('test@example.com')
        .withItems([{ productId: 'prod-1', name: 'Product', quantity: 1, price: 10 }])
        .withShippingAddress({
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'US',
        })
        .build();

      const updatedOrder = { ...existingOrder, status: OrderStatus.PROCESSING, version: 2 };

      mockRepository.findById.mockResolvedValue(existingOrder);
      mockRepository.update.mockResolvedValue(updatedOrder);
      mockEventPublisher.publish.mockResolvedValue();

      const result = await orderService.updateOrder({
        orderId,
        status: 'PROCESSING',
      });

      expect(result.status).toBe(OrderStatus.PROCESSING);
      expect(result.version).toBe(2);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith({
        type: 'ORDER_UPDATED',
        payload: expect.any(Object),
      });
    });

    it('should throw error when order not found', async () => {
      const orderId = 'non-existent' as OrderId;
      mockRepository.findById.mockResolvedValue(null);

      await expect(orderService.updateOrder({ orderId, status: 'PROCESSING' }))
        .rejects
        .toThrow('Order not found');
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order successfully', async () => {
      const orderId = 'order-123' as OrderId;
      const mockOrder: Order = new OrderBuilder()
        .withOrderId(orderId)
        .withCustomerId('customer-123' as CustomerId)
        .withCustomerEmail('test@example.com')
        .withItems([{ productId: 'prod-1', name: 'Product', quantity: 1, price: 10 }])
        .withShippingAddress({
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'US',
        })
        .build();

      mockRepository.findById.mockResolvedValue(mockOrder);
      mockRepository.delete.mockResolvedValue();
      mockEventPublisher.publish.mockResolvedValue();

      await orderService.deleteOrder(orderId, 'Customer requested');

      expect(mockRepository.delete).toHaveBeenCalledWith(orderId);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith({
        type: 'ORDER_DELETED',
        payload: expect.objectContaining({
          orderId,
          reason: 'Customer requested',
        }),
      });
    });
  });
});
