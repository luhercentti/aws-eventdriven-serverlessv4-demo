import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { OrderService } from '../services/order-service';
import { createOrderSchema } from '../models/schemas';
import { OrderId, CustomerId } from '../models/types';
import {
  withMiddleware,
  errorHandlerMiddleware,
  loggingMiddleware,
  corsMiddleware,
  validationMiddleware,
  createResponse,
} from '../middleware/lambda-middleware';
import { createLogger, errorResponse } from '../utils/helpers';
import { ErrorCode } from '../models/types';

const orderService = new OrderService();

/**
 * Create order handler with validation middleware
 */
export const createOrderHandler = withMiddleware(
  async (
    event: APIGatewayProxyEvent & { validatedBody?: unknown },
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('CreateOrderHandler', {
      requestId: context.awsRequestId,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const validatedData = event.validatedBody ?? JSON.parse(event.body ?? '{}');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const order = await orderService.createOrder(validatedData);

      logger.info('Order created successfully', { orderId: order.orderId });

      return createResponse(201, order, context.awsRequestId);
    } catch (error) {
      logger.error('Error creating order', error);
      throw error;
    }
  },
  errorHandlerMiddleware,
  loggingMiddleware,
  corsMiddleware,
  validationMiddleware(createOrderSchema)
);

/**
 * Get order by ID handler
 */
export const getOrderHandler = withMiddleware(
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('GetOrderHandler', { requestId: context.awsRequestId });

    try {
      const orderId = event.pathParameters?.orderId;

      if (orderId === null || orderId === undefined || orderId === '') {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorResponse('Order ID is required', ErrorCode.VALIDATION_ERROR)),
        };
      }

      const order = await orderService.getOrder(orderId as OrderId);

      if (order === null || order === undefined) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorResponse('Order not found', ErrorCode.NOT_FOUND)),
        };
      }

      logger.info('Order retrieved successfully', { orderId });

      return createResponse(200, order, context.awsRequestId);
    } catch (error) {
      logger.error('Error getting order', error);
      throw error;
    }
  },
  errorHandlerMiddleware,
  loggingMiddleware,
  corsMiddleware
);

/**
 * List orders handler
 */
export const listOrdersHandler = withMiddleware(
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('ListOrdersHandler', {
      requestId: context.awsRequestId,
    });

    try {
      const customerId = event.queryStringParameters?.customerId as CustomerId | undefined;
      const limitParam = event.queryStringParameters?.limit ?? null;
      const limit = limitParam !== null ? parseInt(limitParam, 10) : 20;

      const nextToken = event.queryStringParameters?.nextToken;

      const result = await orderService.listOrders(customerId, limit, nextToken);

      logger.info('Orders retrieved successfully', { count: result.orders.length });

      return createResponse(200, result, context.awsRequestId);
    } catch (error) {
      logger.error('Error listing orders', error);
      throw error;
    }
  },
  errorHandlerMiddleware,
  loggingMiddleware,
  corsMiddleware
);

/**
 * Update order handler
 */
export const updateOrderHandler = withMiddleware(
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('UpdateOrderHandler', {
      requestId: context.awsRequestId,
    });

    try {
      const orderId = event.pathParameters?.orderId ?? null;

      if (orderId === null) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorResponse('Order ID is required', ErrorCode.VALIDATION_ERROR)),
        };
      }

      const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>;

      const order = await orderService.updateOrder({
        orderId: orderId as OrderId,
        ...body,
      });

      logger.info('Order updated successfully', { orderId });

      return createResponse(200, order, context.awsRequestId);
    } catch (error) {
      logger.error('Error updating order', error);
      throw error;
    }
  },
  errorHandlerMiddleware,
  loggingMiddleware,
  corsMiddleware
);

/**
 * Delete order handler
 */
export const deleteOrderHandler = withMiddleware(
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('DeleteOrderHandler', {
      requestId: context.awsRequestId,
    });

    try {
      const orderId = event.pathParameters?.orderId ?? null;

      if (orderId === null) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorResponse('Order ID is required', ErrorCode.VALIDATION_ERROR)),
        };
      }

      const body =
        event.body !== null && event.body !== undefined
          ? (JSON.parse(event.body) as { reason?: string })
          : {};

      await orderService.deleteOrder(orderId as OrderId, body.reason);

      logger.info('Order deleted successfully', { orderId });

      return createResponse(204, {}, context.awsRequestId);
    } catch (error) {
      logger.error('Error deleting order', error);
      throw error;
    }
  },
  errorHandlerMiddleware,
  loggingMiddleware,
  corsMiddleware
);
