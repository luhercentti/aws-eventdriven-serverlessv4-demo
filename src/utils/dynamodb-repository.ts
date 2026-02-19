import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Repository, PaginatedResult, QueryParams } from '../models/entities';
import { Logger, createLogger, retryWithBackoff } from './helpers';

/**
 * Generic DynamoDB Repository with resilience patterns
 */
export class DynamoDBRepository<T extends { [key: string]: unknown }, ID> implements Repository<
  T,
  ID
> {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly logger: Logger;

  constructor(
    private readonly tableName: string,
    private readonly primaryKey: string,
    client: DynamoDBClient = new DynamoDBClient({})
  ) {
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });
    this.logger = createLogger('DynamoDBRepository', { tableName });
  }

  async findById(id: ID): Promise<T | null> {
    this.logger.info('Finding item by ID', { id });

    try {
      const result = await retryWithBackoff(
        async () =>
          this.docClient.send(
            new GetCommand({
              TableName: this.tableName,
              Key: { [this.primaryKey]: id },
            })
          ),
        { logger: this.logger }
      );

      if (!result.Item) {
        this.logger.info('Item not found', { id });
        return null;
      }

      return result.Item as T;
    } catch (error) {
      this.logger.error('Error finding item by ID', error, { id });
      throw error;
    }
  }

  async findAll(params?: QueryParams): Promise<PaginatedResult<T>> {
    this.logger.info('Finding all items', { params });

    try {
      const result = await retryWithBackoff(
        async () =>
          this.docClient.send(
            new ScanCommand({
              TableName: this.tableName,
              Limit: params?.limit,
              ExclusiveStartKey:
                params?.nextToken !== null && params?.nextToken !== undefined
                  ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    (JSON.parse(Buffer.from(params.nextToken, 'base64').toString()) as Record<
                      string,
                      unknown
                    >)
                  : undefined,
            })
          ),
        { logger: this.logger }
      );

      return {
        items: (result.Items ?? []) as T[],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        nextToken:
          result.LastEvaluatedKey !== null && result.LastEvaluatedKey !== undefined
            ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
            : undefined,
        count: result.Count ?? 0,
      };
    } catch (error) {
      this.logger.error('Error finding all items', error, { params });
      throw error;
    }
  }

  async save(entity: T): Promise<T> {
    this.logger.info('Saving item', { entity });

    try {
      await retryWithBackoff(
        async () =>
          this.docClient.send(
            new PutCommand({
              TableName: this.tableName,
              Item: entity,
            })
          ),
        { logger: this.logger }
      );

      return entity;
    } catch (error) {
      this.logger.error('Error saving item', error, { entity });
      throw error;
    }
  }

  async update(id: ID, updates: Partial<T>): Promise<T> {
    this.logger.info('Updating item', { id, updates });

    try {
      // Build update expression
      const updateExpressionParts: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, unknown> = {};

      Object.entries(updates).forEach(([key, value], index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        updateExpressionParts.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = value;
      });

      const result = await retryWithBackoff(
        async () =>
          this.docClient.send(
            new UpdateCommand({
              TableName: this.tableName,
              Key: { [this.primaryKey]: id },
              UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
              ExpressionAttributeNames: expressionAttributeNames,
              ExpressionAttributeValues: expressionAttributeValues,
              ReturnValues: 'ALL_NEW',
            })
          ),
        { logger: this.logger }
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return result.Attributes as T;
    } catch (error) {
      this.logger.error('Error updating item', error, { id, updates });
      throw error;
    }
  }

  async delete(id: ID): Promise<void> {
    this.logger.info('Deleting item', { id });

    try {
      await retryWithBackoff(
        async () =>
          this.docClient.send(
            new DeleteCommand({
              TableName: this.tableName,
              Key: { [this.primaryKey]: id },
            })
          ),
        { logger: this.logger }
      );
    } catch (error) {
      this.logger.error('Error deleting item', error, { id });
      throw error;
    }
  }

  async queryByIndex(
    indexName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, unknown>,
    params?: QueryParams
  ): Promise<PaginatedResult<T>> {
    this.logger.info('Querying by index', { indexName, keyConditionExpression });

    try {
      const result = await retryWithBackoff(
        async () =>
          this.docClient.send(
            new QueryCommand({
              TableName: this.tableName,
              IndexName: indexName,
              KeyConditionExpression: keyConditionExpression,
              ExpressionAttributeValues: expressionAttributeValues,
              Limit: params?.limit,
              ExclusiveStartKey:
                params?.nextToken !== null && params?.nextToken !== undefined
                  ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    (JSON.parse(Buffer.from(params.nextToken, 'base64').toString()) as Record<
                      string,
                      unknown
                    >)
                  : undefined,
            })
          ),
        { logger: this.logger }
      );

      return {
        items: (result.Items ?? []) as T[],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        nextToken:
          result.LastEvaluatedKey !== null && result.LastEvaluatedKey !== undefined
            ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
            : undefined,
        count: result.Count ?? 0,
      };
    } catch (error) {
      this.logger.error('Error querying by index', error, { indexName });
      throw error;
    }
  }
}
