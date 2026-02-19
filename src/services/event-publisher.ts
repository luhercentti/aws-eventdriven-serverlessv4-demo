import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { DomainEvent } from '../models/types';
import { createLogger, retryWithBackoff, getEnvVar } from '../utils/helpers';

/**
 * Event publisher for EventBridge with resilience patterns
 */
export class EventPublisher {
  private readonly client: EventBridgeClient;
  private readonly eventBusName: string;
  private readonly source: string;
  private readonly logger = createLogger('EventPublisher');

  constructor(
    eventBusName?: string,
    source?: string,
    client: EventBridgeClient = new EventBridgeClient({})
  ) {
    this.client = client;
    this.eventBusName = eventBusName ?? getEnvVar('EVENT_BUS_NAME');
    this.source = source ?? getEnvVar('EVENT_SOURCE', 'order-service');
  }

  async publish(event: DomainEvent): Promise<void> {
    this.logger.info('Publishing event', { eventType: event.type });

    try {
      await retryWithBackoff(
        async () => {
          const command = new PutEventsCommand({
            Entries: [
              {
                Source: this.source,
                DetailType: event.type,
                Detail: JSON.stringify(event.payload),
                EventBusName: this.eventBusName,
              },
            ],
          });

          const result = await this.client.send(command);

          if (
            result.FailedEntryCount !== null &&
            result.FailedEntryCount !== undefined &&
            result.FailedEntryCount > 0
          ) {
            throw new Error(`Failed to publish event: ${JSON.stringify(result.Entries)}`);
          }

          this.logger.info('Event published successfully', { eventType: event.type });
        },
        { logger: this.logger, maxRetries: 3 }
      );
    } catch (error) {
      this.logger.error('Failed to publish event after retries', error, { eventType: event.type });
      throw error;
    }
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    this.logger.info('Publishing batch of events', { count: events.length });

    try {
      await retryWithBackoff(
        async () => {
          const command = new PutEventsCommand({
            Entries: events.map((event) => ({
              Source: this.source,
              DetailType: event.type,
              Detail: JSON.stringify(event.payload),
              EventBusName: this.eventBusName,
            })),
          });

          const result = await this.client.send(command);

          if (
            result.FailedEntryCount !== null &&
            result.FailedEntryCount !== undefined &&
            result.FailedEntryCount > 0
          ) {
            throw new Error(`Failed to publish events: ${JSON.stringify(result.Entries)}`);
          }

          this.logger.info('Batch events published successfully', { count: events.length });
        },
        { logger: this.logger, maxRetries: 3 }
      );
    } catch (error) {
      this.logger.error('Failed to publish batch events after retries', error);
      throw error;
    }
  }
}

/**
 * Generic event handler interface
 */
export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

/**
 * Event handler registry with type-safe event routing
 */
export class EventHandlerRegistry {
  private readonly handlers = new Map<string, EventHandler<DomainEvent>>();
  private readonly logger = createLogger('EventHandlerRegistry');

  register<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>): void {
    this.logger.info('Registering event handler', { eventType });
    this.handlers.set(eventType, handler as EventHandler<DomainEvent>);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handler = this.handlers.get(event.type);

    if (!handler) {
      this.logger.warn('No handler registered for event type', { eventType: event.type });
      return;
    }

    this.logger.info('Dispatching event to handler', { eventType: event.type });

    try {
      await handler.handle(event);
      this.logger.info('Event handled successfully', { eventType: event.type });
    } catch (error) {
      this.logger.error('Error handling event', error, { eventType: event.type });
      throw error;
    }
  }
}
