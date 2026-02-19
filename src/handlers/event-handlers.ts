import { EventBridgeEvent, Context } from 'aws-lambda';
import { DomainEvent, ExtractEvent } from '../models/types';
import { EventHandler, EventHandlerRegistry } from '../services/event-publisher';
import { NotificationService } from '../services/messaging-service';
import { createLogger, getEnvVar } from '../utils/helpers';

/**
 * Order created event handler
 */
class OrderCreatedHandler implements EventHandler<ExtractEvent<'ORDER_CREATED'>> {
  private readonly logger = createLogger('OrderCreatedHandler');
  private readonly notificationService = new NotificationService();

  async handle(event: ExtractEvent<'ORDER_CREATED'>): Promise<void> {
    this.logger.info('Handling ORDER_CREATED event', { orderId: event.payload.orderId });

    try {
      // Send notification
      const topicArn = getEnvVar('NOTIFICATIONS_TOPIC_ARN', '');

      if (topicArn) {
        await this.notificationService.publishStructured(
          topicArn,
          {
            type: 'ORDER_CREATED',
            orderId: event.payload.orderId,
            customerId: event.payload.customerId,
            totalAmount: event.payload.totalAmount,
            itemCount: event.payload.items.length,
          },
          'New Order Created'
        );
      }

      this.logger.info('ORDER_CREATED event handled successfully');
    } catch (error) {
      this.logger.error('Error handling ORDER_CREATED event', error);
      throw error;
    }
  }
}

/**
 * Order updated event handler
 */
class OrderUpdatedHandler implements EventHandler<ExtractEvent<'ORDER_UPDATED'>> {
  private readonly logger = createLogger('OrderUpdatedHandler');

  handle(event: ExtractEvent<'ORDER_UPDATED'>): Promise<void> {
    this.logger.info('Handling ORDER_UPDATED event', { orderId: event.payload.orderId });

    try {
      // Process order update (e.g., update search index, cache, etc.)
      this.logger.info('ORDER_UPDATED event handled successfully');
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Error handling ORDER_UPDATED event', error);
      throw error;
    }
  }
}

/**
 * Order deleted event handler
 */
class OrderDeletedHandler implements EventHandler<ExtractEvent<'ORDER_DELETED'>> {
  private readonly logger = createLogger('OrderDeletedHandler');

  handle(event: ExtractEvent<'ORDER_DELETED'>): Promise<void> {
    this.logger.info('Handling ORDER_DELETED event', { orderId: event.payload.orderId });

    try {
      // Process order deletion (e.g., cleanup resources, update indexes, etc.)
      this.logger.info('ORDER_DELETED event handled successfully');
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Error handling ORDER_DELETED event', error);
      throw error;
    }
  }
}

/**
 * Payment processed event handler
 */
class PaymentProcessedHandler implements EventHandler<ExtractEvent<'PAYMENT_PROCESSED'>> {
  private readonly logger = createLogger('PaymentProcessedHandler');
  private readonly notificationService = new NotificationService();

  async handle(event: ExtractEvent<'PAYMENT_PROCESSED'>): Promise<void> {
    this.logger.info('Handling PAYMENT_PROCESSED event', {
      orderId: event.payload.orderId,
      status: event.payload.status,
    });

    try {
      // Send payment notification
      const topicArn = getEnvVar('NOTIFICATIONS_TOPIC_ARN', '');

      if (topicArn) {
        await this.notificationService.publishStructured(
          topicArn,
          {
            type: 'PAYMENT_PROCESSED',
            orderId: event.payload.orderId,
            paymentId: event.payload.paymentId,
            status: event.payload.status,
            amount: event.payload.amount,
          },
          'Payment Status Update'
        );
      }

      this.logger.info('PAYMENT_PROCESSED event handled successfully');
    } catch (error) {
      this.logger.error('Error handling PAYMENT_PROCESSED event', error);
      throw error;
    }
  }
}

// Initialize event handler registry
const registry = new EventHandlerRegistry();
registry.register('ORDER_CREATED', new OrderCreatedHandler());
registry.register('ORDER_UPDATED', new OrderUpdatedHandler());
registry.register('ORDER_DELETED', new OrderDeletedHandler());
registry.register('PAYMENT_PROCESSED', new PaymentProcessedHandler());

/**
 * EventBridge event handler
 */
export const eventBridgeHandler = async (
  event: EventBridgeEvent<string, unknown>,
  context: Context
): Promise<void> => {
  const logger = createLogger('EventBridgeHandler', { requestId: context.awsRequestId });

  logger.info('Processing EventBridge event', {
    detailType: event['detail-type'],
    source: event.source,
  });

  try {
    // Map EventBridge event to domain event
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const domainEvent: any = {
      type: event['detail-type'] as DomainEvent['type'],
      payload: event.detail as DomainEvent['payload'],
    };

    // Dispatch to appropriate handler
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await registry.dispatch(domainEvent);

    logger.info('Event processed successfully');
  } catch (error) {
    logger.error('Error processing EventBridge event', error);
    throw error;
  }
};
