import { OrderBuilder, OrderStatus } from '../../src/models/entities';
import { OrderId, CustomerId } from '../../src/models/types';

describe('OrderBuilder', () => {
  it('should build a valid order', () => {
    const order = new OrderBuilder()
      .withOrderId('order-123' as OrderId)
      .withCustomerId('customer-123' as CustomerId)
      .withCustomerEmail('test@example.com')
      .withItems([
        {
          productId: 'prod-1',
          name: 'Test Product',
          quantity: 2,
          price: 29.99,
        },
      ])
      .withShippingAddress({
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'US',
      })
      .build();

    expect(order).toMatchObject({
      orderId: 'order-123',
      customerId: 'customer-123',
      customerEmail: 'test@example.com',
      status: OrderStatus.PENDING,
      totalAmount: 59.98,
      version: 1,
    });
    expect(order.createdAt).toBeDefined();
    expect(order.updatedAt).toBeDefined();
  });

  it('should calculate total amount correctly', () => {
    const order = new OrderBuilder()
      .withOrderId('order-123' as OrderId)
      .withCustomerId('customer-123' as CustomerId)
      .withCustomerEmail('test@example.com')
      .withItems([
        { productId: 'prod-1', name: 'Product 1', quantity: 2, price: 10.00 },
        { productId: 'prod-2', name: 'Product 2', quantity: 3, price: 15.00 },
      ])
      .withShippingAddress({
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'US',
      })
      .build();

    expect(order.totalAmount).toBe(65.00);
  });

  it('should throw error when required fields are missing', () => {
    expect(() => {
      new OrderBuilder()
        .withCustomerId('customer-123' as CustomerId)
        .build();
    }).toThrow('Order ID is required');

    expect(() => {
      new OrderBuilder()
        .withOrderId('order-123' as OrderId)
        .build();
    }).toThrow('Customer ID is required');

    expect(() => {
      new OrderBuilder()
        .withOrderId('order-123' as OrderId)
        .withCustomerId('customer-123' as CustomerId)
        .build();
    }).toThrow('Customer email is required');
  });

  it('should support optional metadata', () => {
    const order = new OrderBuilder()
      .withOrderId('order-123' as OrderId)
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
      .withMetadata({ source: 'mobile-app', campaign: 'summer-sale' })
      .build();

    expect(order.metadata).toEqual({
      source: 'mobile-app',
      campaign: 'summer-sale',
    });
  });
});
