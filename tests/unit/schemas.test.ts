import { createOrderSchema, updateOrderSchema } from '../../src/models/schemas';
import { ZodError } from 'zod';

describe('Schema Validation', () => {
  describe('createOrderSchema', () => {
    it('should validate a valid order request', () => {
      const validRequest = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174000',
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
        },
      };

      const result = createOrderSchema.parse(validRequest);

      expect(result).toMatchObject({
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        shippingAddress: {
          country: 'US', // Default value
        },
      });
    });

    it('should reject invalid email', () => {
      const invalidRequest = {
        customerId: 'customer-123',
        customerEmail: 'invalid-email',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174000',
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
        },
      };

      expect(() => createOrderSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject invalid UUID for productId', () => {
      const invalidRequest = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        items: [
          {
            productId: 'invalid-uuid',
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
        },
      };

      expect(() => createOrderSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject negative quantity', () => {
      const invalidRequest = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Product',
            quantity: -1,
            price: 29.99,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
        },
      };

      expect(() => createOrderSchema.parse(invalidRequest)).toThrow(ZodError);
    });

    it('should reject invalid zip code format', () => {
      const invalidRequest = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        items: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Product',
            quantity: 1,
            price: 29.99,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: 'INVALID',
        },
      };

      expect(() => createOrderSchema.parse(invalidRequest)).toThrow(ZodError);
    });
  });

  describe('updateOrderSchema', () => {
    it('should validate a valid update request', () => {
      const validRequest = {
        orderId: 'order-123',
        status: 'PROCESSING',
      };

      const result = updateOrderSchema.parse(validRequest);

      expect(result).toMatchObject({
        orderId: 'order-123',
        status: 'PROCESSING',
      });
    });

    it('should accept optional fields', () => {
      const validRequest = {
        orderId: 'order-123',
      };

      const result = updateOrderSchema.parse(validRequest);

      expect(result).toMatchObject({
        orderId: 'order-123',
      });
      expect(result.status).toBeUndefined();
      expect(result.items).toBeUndefined();
    });

    it('should reject invalid status', () => {
      const invalidRequest = {
        orderId: 'order-123',
        status: 'INVALID_STATUS',
      };

      expect(() => updateOrderSchema.parse(invalidRequest)).toThrow(ZodError);
    });
  });
});
