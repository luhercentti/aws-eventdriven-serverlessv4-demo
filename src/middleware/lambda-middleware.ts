import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ZodSchema, ZodError } from 'zod';
import { ErrorCode } from '../models/types';
import { createLogger, errorResponse, successResponse } from '../utils/helpers';

/**
 * Lambda handler wrapper with middleware support
 */
export type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export type Middleware = (
  event: APIGatewayProxyEvent,
  context: Context,
  next: () => Promise<APIGatewayProxyResult>
) => Promise<APIGatewayProxyResult>;

/**
 * Compose multiple middlewares
 */
export function composeMiddleware(...middlewares: Middleware[]): Middleware {
  return async (event, context, handler) => {
    let index = 0;

    const next = async (): Promise<APIGatewayProxyResult> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        return middleware ? middleware(event, context, next) : handler();
      }
      return handler();
    };

    return next();
  };
}

/**
 * Error handling middleware
 */
export const errorHandlerMiddleware: Middleware = async (_event, context, next) => {
  const logger = createLogger('ErrorHandler', { requestId: context.awsRequestId });

  try {
    return await next();
  } catch (error) {
    logger.error('Unhandled error in Lambda function', error);

    if (error instanceof ZodError) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify(
          errorResponse(
            {
              message: 'Validation error',
              details: error.errors,
            },
            ErrorCode.VALIDATION_ERROR
          )
        ),
      };
    }

    if (error instanceof Error) {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify(
          errorResponse(
            {
              message: error.message,
            },
            ErrorCode.INTERNAL_ERROR
          )
        ),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify(
        errorResponse(
          {
            message: 'Internal server error',
          },
          ErrorCode.INTERNAL_ERROR
        )
      ),
    };
  }
};

/**
 * Logging middleware
 */
export const loggingMiddleware: Middleware = async (event, context, next) => {
  const logger = createLogger('Lambda', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    requestId: context.awsRequestId,
  });

  logger.info('Request received', {
    path: event.path,
    method: event.httpMethod,
    queryParams: event.queryStringParameters,
  });

  const startTime = Date.now();
  const result = await next();
  const duration = Date.now() - startTime;

  logger.info('Request completed', {
    statusCode: result.statusCode,
    duration,
  });

  return result;
};

/**
 * CORS middleware
 */
export const corsMiddleware: Middleware = async (_event, _context, next) => {
  const result = await next();

  return {
    ...result,
    headers: {
      ...result.headers,
      ...corsHeaders(),
    },
  };
};

/**
 * Request validation middleware factory
 */
export function validationMiddleware<T>(schema: ZodSchema<T>): Middleware {
  return async (event, context, next) => {
    const logger = createLogger('Validation', {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      requestId: context.awsRequestId,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = event.body !== null && event.body !== undefined ? JSON.parse(event.body) : {};
      const validated = schema.parse(body);

      // Attach validated data to event
      (event as unknown as { validatedBody: T }).validatedBody = validated;

      logger.debug('Request validation successful');
      return await next();
    } catch (error) {
      logger.warn('Request validation failed', { error });
      throw error;
    }
  };
}

/**
 * Common CORS headers
 */
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
  };
}

/**
 * Create handler with middleware
 */
export function withMiddleware(
  handler: LambdaHandler,
  ...middlewares: Middleware[]
): LambdaHandler {
  const composed = composeMiddleware(...middlewares);

  return async (event, context) => {
    return composed(event, context, () => handler(event, context));
  };
}

/**
 * Helper to create API Gateway response
 */
export function createResponse<T>(
  statusCode: number,
  data: T,
  requestId?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(
      successResponse(
        data,
        requestId !== null && requestId !== undefined ? { requestId } : undefined
      )
    ),
  };
}
