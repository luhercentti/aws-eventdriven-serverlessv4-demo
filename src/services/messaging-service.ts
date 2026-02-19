import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { createLogger, retryWithBackoff } from '../utils/helpers';

/**
 * Message queue service for SQS with batching support
 */
export class QueueService {
  private readonly client: SQSClient;
  private readonly logger = createLogger('QueueService');

  constructor(client: SQSClient = new SQSClient({})) {
    this.client = client;
  }

  async sendMessage<T>(queueUrl: string, message: T, delaySeconds = 0): Promise<void> {
    this.logger.info('Sending message to queue', { queueUrl });

    try {
      await retryWithBackoff(
        async () => {
          const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
            DelaySeconds: delaySeconds,
          });

          await this.client.send(command);
          this.logger.info('Message sent successfully', { queueUrl });
        },
        { logger: this.logger }
      );
    } catch (error) {
      this.logger.error('Failed to send message', error, { queueUrl });
      throw error;
    }
  }

  async sendBatch<T>(queueUrl: string, messages: T[]): Promise<void> {
    this.logger.info('Sending batch of messages', { queueUrl, count: messages.length });

    try {
      // SQS batch limit is 10 messages
      const batches = this.chunkArray(messages, 10);

      for (const batch of batches) {
        await retryWithBackoff(
          async () => {
            const command = new SendMessageBatchCommand({
              QueueUrl: queueUrl,
              Entries: batch.map((message, index) => ({
                Id: `${index}`,
                MessageBody: JSON.stringify(message),
              })),
            });

            const result = await this.client.send(command);

            if (result.Failed && result.Failed.length > 0) {
              throw new Error(`Failed to send messages: ${JSON.stringify(result.Failed)}`);
            }
          },
          { logger: this.logger }
        );
      }

      this.logger.info('Batch messages sent successfully', { count: messages.length });
    } catch (error) {
      this.logger.error('Failed to send batch messages', error);
      throw error;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Notification service for SNS
 */
export class NotificationService {
  private readonly client: SNSClient;
  private readonly logger = createLogger('NotificationService');

  constructor(client: SNSClient = new SNSClient({})) {
    this.client = client;
  }

  async publish(topicArn: string, message: string, subject?: string): Promise<void> {
    this.logger.info('Publishing notification', { topicArn });

    try {
      await retryWithBackoff(
        async () => {
          const command = new PublishCommand({
            TopicArn: topicArn,
            Message: message,
            Subject: subject,
          });

          await this.client.send(command);
          this.logger.info('Notification published successfully', { topicArn });
        },
        { logger: this.logger }
      );
    } catch (error) {
      this.logger.error('Failed to publish notification', error, { topicArn });
      throw error;
    }
  }

  async publishStructured<T>(topicArn: string, message: T, subject?: string): Promise<void> {
    await this.publish(topicArn, JSON.stringify(message), subject);
  }
}
