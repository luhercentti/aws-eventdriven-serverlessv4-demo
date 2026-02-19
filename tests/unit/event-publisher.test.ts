import { EventPublisher, EventHandlerRegistry, EventHandler } from '../../src/services/event-publisher';
import { ExtractEvent } from '../../src/models/types';

describe('EventPublisher', () => {
  let eventPublisher: EventPublisher;

  beforeEach(() => {
    eventPublisher = new EventPublisher('test-bus', 'test-service');
  });

  // These are integration tests that would need AWS credentials
  // In a real scenario, you'd use mocks or LocalStack
  it('should be instantiated correctly', () => {
    expect(eventPublisher).toBeDefined();
  });
});

describe('EventHandlerRegistry', () => {
  let registry: EventHandlerRegistry;

  beforeEach(() => {
    registry = new EventHandlerRegistry();
  });

  it('should register and dispatch events to handlers', async () => {
    const mockHandler: EventHandler<ExtractEvent<'ORDER_CREATED'>> = {
      handle: jest.fn().mockResolvedValue(undefined),
    };

    registry.register('ORDER_CREATED', mockHandler);

    const event: ExtractEvent<'ORDER_CREATED'> = {
      type: 'ORDER_CREATED',
      payload: {
        orderId: 'order-123' as never,
        customerId: 'customer-123' as never,
        items: [],
        totalAmount: 100,
        createdAt: new Date().toISOString(),
      },
    };

    await registry.dispatch(event);

    expect(mockHandler.handle).toHaveBeenCalledWith(event);
  });

  it('should handle events without registered handlers gracefully', async () => {
    const event: ExtractEvent<'ORDER_UPDATED'> = {
      type: 'ORDER_UPDATED',
      payload: {
        orderId: 'order-123' as never,
        updates: {},
        updatedAt: new Date().toISOString(),
      },
    };

    // Should not throw
    await expect(registry.dispatch(event)).resolves.not.toThrow();
  });

  it('should propagate errors from handlers', async () => {
    const mockHandler: EventHandler<ExtractEvent<'ORDER_CREATED'>> = {
      handle: jest.fn().mockRejectedValue(new Error('Handler error')),
    };

    registry.register('ORDER_CREATED', mockHandler);

    const event: ExtractEvent<'ORDER_CREATED'> = {
      type: 'ORDER_CREATED',
      payload: {
        orderId: 'order-123' as never,
        customerId: 'customer-123' as never,
        items: [],
        totalAmount: 100,
        createdAt: new Date().toISOString(),
      },
    };

    await expect(registry.dispatch(event)).rejects.toThrow('Handler error');
  });
});
