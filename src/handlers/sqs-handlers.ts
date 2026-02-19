import { SQSEvent, SQSHandler, Context } from 'aws-lambda';
import { createLogger } from '../utils/helpers';

const logger = createLogger('SQSHandler');

/**
 * SQS message handler with batch processing
 */
export const sqsHandler: SQSHandler = async (event: SQSEvent, context: Context): Promise<void> => {
  logger.info('Processing SQS messages', {
    requestId: context.awsRequestId,
    messageCount: event.Records.length,
  });

  const failedMessages: string[] = [];

  // Process messages in parallel
  await Promise.allSettled(
    event.Records.map((record) => {
      try {
        logger.info('Processing message', { messageId: record.messageId });

        const body = JSON.parse(record.body) as { type?: string; data?: unknown };

        // Example: Process different message types
        switch (body.type) {
          case 'PROCESS_ORDER':
            processOrder(body.data);
            break;
          case 'SEND_EMAIL':
            sendEmail(body.data);
            break;
          default:
            logger.warn('Unknown message type', { type: body.type ?? 'undefined' });
        }

        logger.info('Message processed successfully', { messageId: record.messageId });
        return Promise.resolve();
      } catch (error) {
        logger.error('Error processing message', error, { messageId: record.messageId });
        failedMessages.push(record.messageId);
        return Promise.reject(error);
      }
    })
  );

  if (failedMessages.length > 0) {
    logger.error('Some messages failed to process', undefined, { failedMessages });
    throw new Error(`Failed to process ${failedMessages.length} messages`);
  }

  logger.info('All messages processed successfully');
};

function processOrder(data: unknown): void {
  // Example order processing logic
  logger.info('Processing order', { data });
}

function sendEmail(data: unknown): void {
  // Example email sending logic
  logger.info('Sending email', { data });
}
