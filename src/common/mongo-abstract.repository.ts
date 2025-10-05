import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  AggregateOptions,
  PipelineStage,
  QueryOptions,
  ClientSession,
  Connection,
  CreateOptions,
  Document,
  FilterQuery,
  Model,
  SortOrder,
  Types,
  UpdateQuery,
} from 'mongoose';

export type FindOneOptions<T> = {
  projection?: Record<keyof T, unknown>;
  sort?: { [key: string]: SortOrder } | string;
  populate?: string | string[];
  populateSelect?: string;
};

export type FindByIdOptions<T> = {
  populate?: string | string[];
  populateSelect?: string;
  projection?: Record<keyof T, unknown>;
  session?: ClientSession;
};

export type DeleteOptions = {
  session?: ClientSession;
};
/**
 * Abstract class for creating MongoDB repositories with common CRUD operations.
 * This class provides a set of reusable methods for interacting with MongoDB using Mongoose.
 * @template T - The type of the MongoDB document.
 *
 * Usage Example:
 * ```typescript
 * class UserRepository extends EntityRepository<User> {
 * constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super({ entityModel: userModel });
  }
 *   // Additional methods specific to the User entity can be added here.
 * }
 * ```
 */
export abstract class EntityRepository<T extends Document> {
  private readonly logger = new Logger(EntityRepository.name);
  protected entityModel: Model<T>;

  /**
   * Constructor for the EntityRepository class.
   * @param options - Configuration options for the repository.
   * @param options.entityModel - Mongoose model representing the entity.
   * @param options.connection -  Databse connection
   * @param options.errLogger - Whether to enable error logging (default is false).
   * @throws Error if entityModel is not provided.
   */
  constructor(
    protected readonly options: Partial<{
      entityModel: Model<T>;
      connection?: Connection;
      errLogger?: boolean;
    }> = {
      errLogger: false,
    },
  ) {
    if (!options.entityModel) {
      throw new Error('entityModel is required');
    }
  }

  /**
   * Creates a new document in the database using the provided data.
   * @param createEntity - The data for creating the new document.
   * @returns Promise resolving to the created document.
   * @throws HttpException with appropriate status code if creation fails.
   */
  async create(createEntity: unknown, options?: CreateOptions) {
    try {
      return await new this.options.entityModel(createEntity).save(options);
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Creates multiple documents.
   * @param createEntities - Array of data for creating the new documents.
   * @returns Promise resolving to an array of the created documents.
   * @throws HttpException with appropriate status code if creation fails for any document.
   */
  async createMany(
    createEntities: unknown[],
    options?: { session?: ClientSession },
  ): Promise<T[]> {
    try {
      const createdDocuments = await this.options.entityModel.create(
        createEntities,
        options,
      );
      return createdDocuments;
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Finds documents based on the provided filter query.
   * @param entityFilterQuery - Filter criteria for querying documents.
   * @param projection - Fields to include/exclude from the result.
   * @param options - Additional options such as skip and limit and sort for pagination.
   * @returns Promise resolving to an array of documents.
   */
  async find(
    entityFilterQuery: FilterQuery<T>,
    options?: {
      skip?: number;
      limit?: number;
      sort: { [key: string]: SortOrder } | string;
    },
    projection?: Record<string, unknown>,
  ): Promise<T[]> {
    const { sort, limit } = options || {};
    const currentPageSize = limit ?? 100;
    const skip = options?.skip || 0;

    // TODO LEARN MORE ABOUT PROJECTION
    // !https://medium.com/@AbbasPlusPlus/mongodb-query-projections-explained-183151d06e01
    const data = await this.options.entityModel
      .find(entityFilterQuery, projection)
      .skip(skip)
      .limit(currentPageSize)
      .sort(sort)
      .exec();

    return data;
  }

  async findLean(
    entityFilterQuery: FilterQuery<T>,
    options?: {
      skip?: number;
      limit?: number;
      sort?: { [key: string]: SortOrder } | string;
      populate?: string | string[];
      populateSelect?: string;
      session?: ClientSession;
    },
    projection?: Record<string, unknown>,
  ) {
    const { sort, limit, populate, populateSelect, session } = options || {};
    const currentPageSize = limit ?? 100;
    const skip = options?.skip || 0;

    // TODO LEARN MORE ABOUT PROJECTION
    // !https://medium.com/@AbbasPlusPlus/mongodb-query-projections-explained-183151d06e01
    const data = await this.options.entityModel
      .find(entityFilterQuery, projection, { session })
      .skip(skip)
      .limit(currentPageSize)
      .sort(sort)
      .populate(populate ?? '', populateSelect ?? '')
      .lean<T[]>()
      .exec();

    return data;
  }

  /**
   * Finds documents based on the provided filter query.
   * @param entityFilterQuery - Filter criteria for querying documents.
   * @param projection - Fields to include/exclude from the result.
   * @param options - Additional options such as skip and limit and sort for pagination.
   * @returns Promise resolving to an array of documents.
   */
  async findPaginated(
    entityFilterQuery: FilterQuery<T>,
    options?: {
      skip?: number;
      limit?: number;
      populate?: string | string[];
      populateSelect?: string;
      sort: { [key: string]: SortOrder } | string;
    },
    projection?: Record<string, unknown>,
  ): Promise<{
    data: T[];
    total: number;
    currentPageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageNumber: number;
  }> {
    const { sort, limit, populate, populateSelect } = options || {};
    const currentPageSize = limit ?? 100;
    const skip = options?.skip || 0;
    entityFilterQuery = { ...entityFilterQuery, deleted: false };
    const data = await this.options.entityModel
      .find(entityFilterQuery, projection)
      .skip(skip)
      .limit(currentPageSize)
      .sort(sort)
      .populate(populate ?? '', populateSelect ?? '')
      .exec();
    const count = await this.count(entityFilterQuery);

    const hasNextPage = skip + currentPageSize < count;
    const hasPreviousPage = skip > 0;

    const pageNumber = Math.floor(skip / currentPageSize) + 1;

    return {
      data,
      total: count,
      currentPageSize,
      hasNextPage,
      hasPreviousPage,
      pageNumber,
    };
  }

  /**
   * Finds documents based on the provided filter query. The documents are returned as lean objects.
   * @param entityFilterQuery - Filter criteria for querying documents.
   * @param projection - Fields to include/exclude from the result.
   * @param options - Additional options such as skip and limit and sort for pagination.
   * @returns Promise resolving to an array of documents.
   */
  async findPaginatedLean(
    entityFilterQuery: FilterQuery<T>,
    options?: {
      skip?: number;
      limit?: number;
      sort: { [key: string]: SortOrder } | string;
      populate?: string | string[];
      populateSelect?: string;
    },
    projection?: Record<string, number>,
  ): Promise<{
    data: T[];
    total: number;
    currentPageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageNumber: number;
  }> {
    const { sort, limit, populate, populateSelect } = options || {};
    const currentPageSize = limit ?? 100;
    const skip = options?.skip || 0;
    const data = await this.options.entityModel
      .find(entityFilterQuery, projection)
      .skip(skip)
      .limit(currentPageSize)
      .sort(sort)
      .populate(populate ?? '', populateSelect ?? '')
      .lean()
      .exec();
    const count = await this.count(entityFilterQuery);

    const hasNextPage = skip + currentPageSize < count;
    const hasPreviousPage = skip > 0;

    const pageNumber = Math.floor(skip / currentPageSize) + 1;

    return {
      data: data as T[],
      total: count,
      currentPageSize,
      hasNextPage,
      hasPreviousPage,
      pageNumber,
    };
  }

  /**
   * Finds a document by its ID.
   * @param id - ID of the document to retrieve.
   * @param options
   * @param projection - Fields to include/exclude from the result.
   * @returns Promise resolving to the found document or null.
   * @throws HttpException with NOT_FOUND status if no document is found.
   */
  async findById(
    id: string | Types.ObjectId,
    options?: {
      populate?: string | string[];
      populateSelect?: string;
    },
    projection?: Record<string, unknown>,
  ): Promise<T | null> {
    const { populate, populateSelect } = options || {};

    const data = await this.options.entityModel
      .findById(id, projection)
      .populate(populate ?? '', populateSelect ?? '')
      .exec();

    if (!data) {
      throw new HttpException(
        `No data found with ID ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return data as T;
  }

  async findByIdLean(
    id: string | Types.ObjectId,
    options?: FindByIdOptions<T>,
  ) {
    const { populate, populateSelect, projection, session } = options || {};

    const data = await this.options.entityModel
      .findById(id, projection, { session })
      .populate(populate ?? '', populateSelect ?? '')
      .lean<T>()
      .exec();

    if (!data) {
      throw new HttpException(
        `No data found with ID ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return data;
  }
  /**
   * Finds a single document based on the provided filter query.
   * @param entityFilterQuery - Filter criteria for querying the document.
   * @param projection - Fields to include/exclude from the result.
   * @returns Promise resolving to the found document or null.
   */
  async findOne(
    entityFilterQuery: FilterQuery<T>,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    const { projection, sort, populate, populateSelect } = options || {};

    const result = await this.options.entityModel
      .findOne(entityFilterQuery, projection)
      .sort(sort)
      .populate(populate, populateSelect)
      .exec();

    return result as T;
  }

  /**
   * Finds a single Lean document based on the provided filter query.
   * @param entityFilterQuery - Filter criteria for querying the document.
   * @param projection - Fields to include/exclude from the result.
   * @returns Promise resolving to the found document or null.
   */
  async findOneLean(
    entityFilterQuery: FilterQuery<T>,
    // options?: { projection?: Record<string, unknown>; sort: 'createdAt:-1' | string },
    options?: FindOneOptions<T>,
  ) {
    const { projection, sort, populate, populateSelect } = options || {};
    return this.options.entityModel
      .findOne(entityFilterQuery, projection)
      .populate(populate ?? '', populateSelect ?? '')
      .sort(sort)
      .lean<T>()
      .exec();
  }

  /**
   * Performs a full-text search on the specified field.
   * @param searchText - The text to search for.
   * @param searchField - The field to search in.
   * @returns Promise resolving to an array of documents matching the search criteria.
   * @throws HttpException with appropriate status code if the search fails.
   */
  async fullTextSearch(searchText: string, searchField: string): Promise<T[]> {
    try {
      const searchQuery = {
        [searchField]: { $regex: searchText, $options: 'i' },
      } as FilterQuery<T>;
      return this.options.entityModel.find(searchQuery).exec();
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Counts the number of documents based on the provided filter query.
   * @param entityFilterQuery - Filter criteria for counting documents.
   * @returns Promise resolving to the count of matching documents.
   */
  async count(entityFilterQuery: FilterQuery<T>): Promise<number> {
    try {
      return await this.options.entityModel
        .countDocuments(entityFilterQuery)
        .exec();
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Finds distinct values for a specified field based on the provided filter query.
   * @param field - Field for which to find distinct values.
   * @param entityFilterQuery - Filter criteria for finding distinct values.
   * @returns Promise resolving to an array of distinct values.
   */
  async distinctValues(
    field: string,
    entityFilterQuery?: FilterQuery<T>,
  ): Promise<any[]> {
    try {
      return await this.options.entityModel
        .distinct(field, entityFilterQuery)
        .exec();
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Updates single document based on the provided filter query.
   * @param filterQuery - Filter criteria for updating documents.
   * @param update - Data to update documents with.
   * @returns Promise resolving to the number of updated documents.
   * @throws HttpException with appropriate status code if update fails.
   */
  async updateOne(
    filterQuery: FilterQuery<T>,
    update: UpdateQuery<unknown>,
    options?: { session?: ClientSession },
  ): Promise<number> {
    try {
      const updateResult = await this.options.entityModel
        .updateOne(filterQuery, update, options)
        .exec();
      return updateResult.modifiedCount || 0;
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Updates multiple documents based on the provided filter query.
   * @param filterQuery - Filter criteria for updating documents.
   * @param update - Data to update documents with.
   * @returns Promise resolving to the number of updated documents.
   * @throws HttpException with appropriate status code if update fails.
   */
  async updateMany(
    filterQuery: FilterQuery<T>,
    update: UpdateQuery<unknown>,
    options?: { session?: ClientSession },
  ): Promise<number> {
    try {
      const updateResult = await this.options.entityModel
        .updateMany(filterQuery, update, options)
        .exec();
      return updateResult.modifiedCount || 0;
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Asynchronously finds a document based on the provided filter query and updates it.
   * If no document matches the filter query, it may create a new document based on the upsert option.
   *
   * @param filterQuery - The query object used to filter the document to be updated.
   * @param updatedObject - An object representing the updates to be applied to the document.
   * @param options - Optional configuration for the update operation. Defaults to {  upsert: false, new:true }.
   *   - new: (boolean) to specify whether to return the updated document or the original document. {default:true}
   *   - upsert: Whether to create a new document if no match is found (default: false).
   *   - session: The session used
   *
   * @returns A Promise resolving to the updated document or null if no document is found.
   */
  async findOneAndUpdate(
    filterQuery: FilterQuery<T>,
    updatedObject: UpdateQuery<T>,
    options: QueryOptions<T> = {
      new: true,
      upsert: false,
    },
  ): Promise<T | null> {
    // options: {
    //   new?: boolean
    //   versionKey?: string
    //   incVersion?: boolean
    //   upsert?: boolean
    //   returnDocument?: 'after' | 'after'
    // }

    try {
      // const { returnDocument, upsert } = options
      return await this.options.entityModel.findOneAndUpdate(
        filterQuery,
        updatedObject,
        options,
      );
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Updates a document by its ID with the provided update data.
   * Uses optimistic concurrency control to handle potential race conditions.
   * @param id - ID of the document to update.
   * @param update - Data to update the document with.
   * @returns Promise resolving to the updated document.
   * @throws HttpException with appropriate status code if update fails.
   */
  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
  ): Promise<T> {
    const session = await this.options.entityModel.startSession();
    session.startTransaction();

    try {
      const existingDoc = await this.options.entityModel
        .findById(id)
        .session(session);
      if (!existingDoc) {
        throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
        // throw new HttpException(`No data found with ID ${id}`, HttpStatus.NOT_FOUND)
      }

      // Simulate optimistic concurrency control
      if (update.__v && existingDoc.__v !== update.__v) {
        throw new HttpException('CONFLICT', HttpStatus.CONFLICT);
        // throw new HttpException('Concurrency conflict', HttpStatus.CONFLICT)
      }

      const updatedDoc = await this.options.entityModel.findByIdAndUpdate(
        id,
        { ...update, __v: existingDoc.__v + 1 },
        { new: true, session },
      );

      await session.commitTransaction();
      session.endSession();

      return updatedDoc;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error?.response === 'NOT_FOUND') {
        throw new HttpException(
          `No data found with ID ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error?.response === 'CONFLICT') {
        throw new HttpException('Concurrency conflict', HttpStatus.CONFLICT);
      }
    }
  }

  /**
   * Deletes a single document based on the provided filter query.
   * @param filterQuery - Filter criteria for deleting the document.
   * @returns Promise resolving to true if the document was deleted, false otherwise.
   * @throws HttpException with appropriate status code if
   */
  async deleteOne(filterQuery: FilterQuery<T>): Promise<boolean> {
    try {
      const deleteResult =
        await this.options.entityModel.deleteOne(filterQuery);
      return deleteResult.deletedCount >= 1;
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Deletes multiple documents based on the provided filter query.
   * @param filterQuery - Filter criteria for deleting documents.
   * @returns Promise resolving to true if one or more documents were deleted, false otherwise.
   * @throws HttpException with appropriate status code if deletion fails.
   */
  async deleteMany(
    filterQuery: FilterQuery<T>,
    options: DeleteOptions,
  ): Promise<boolean> {
    const { session } = options || {};
    try {
      const deleteResult = await this.options.entityModel.deleteMany(
        filterQuery,
        { session },
      );
      return deleteResult.deletedCount >= 1;
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  // Transaction and Session Management

  /**
   * Starts a new database session and transaction.
   * @returns Promise resolving to the started session.
   */
  async startTransaction(): Promise<ClientSession> {
    if (!this.options.connection)
      this.handleDatabaseError(
        new Error('Databse connection option not defined'),
      );
    const session = await this.options.connection.startSession();
    session.startTransaction();
    return session;
  }

  /**
   * Commits the ongoing transaction and ends the provided session.
   * @param session - The database session to commit and end.
   * @throws HttpException with appropriate status code if committing the transaction fails.
   */
  // async commitTransaction(session: ClientSession): Promise<void> {
  //   try {
  //     await session.commitTransaction()
  //   } catch (error) {
  //     // If committing the transaction fails, handle the error.
  //     await session.abortTransaction()
  //     session.endSession()
  //     this.handleDatabaseError(error)
  //   }
  // }

  async startClientTransaction(): Promise<ClientSession> {
    if (!this.options.connection)
      this.handleDatabaseError(
        new Error('Databse connection option not defined'),
      );
    const session = await this.options.connection.startSession();
    session.startTransaction();
    return session;
  }

  async commitClientTransaction(session: ClientSession) {
    await session.commitTransaction();
    session.endSession();
  }

  async abortClientTransaction(session: ClientSession) {
    await session.abortTransaction();
    session.endSession();
  }

  endClientTransaction(session: ClientSession): void {
    session.endSession();
  }
  // Additional Operations

  /**
   * Executes an aggregation pipeline on the entity's collection.
   * @param aggregatePipeline - Array of stages to process documents.
   * @returns Promise resolving to an array of aggregated results.
   * @throws HttpException with appropriate status code if aggregation fails.
   */
  async aggregate(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
  ): Promise<any[]> {
    try {
      return await this.options.entityModel.aggregate(pipeline, options).exec();
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  /**
   * Checks if the database connection for the entity is currently established.
   * @returns Promise resolving to true if connected, false otherwise.
   */
  async isDatabaseConnected(): Promise<boolean> {
    try {
      const isConnected = this.options.entityModel.db.readyState === 1;
      return isConnected;
    } catch {
      return false;
    }
  }

  private handleDatabaseError(error: any): void {
    if (this.options.errLogger) {
      this.logger.log(error);
      this.logger.error(
        `Database Error: ${error?.name} -  ${error.message || error}`,
      );
    }
    let errorMessage = 'Database operation failed';
    let errorStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    switch (error.code) {
      case 11000:
        const duplicatedValues = JSON.stringify(error.keyValue);
        errorStatusCode = HttpStatus.BAD_REQUEST;
        // errorMessage = `${Object.values(error.keyValue)[0]} already exists`;
        errorMessage = `${duplicatedValues} already exists`;
        break;
      case 11001:
        errorStatusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Duplicate key error';
        break;
      case 12000:
        errorStatusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Invalid index specification';
        break;
      case 12010:
        errorStatusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Cannot build index on a non-existing field';
        break;
      case 12102:
        errorStatusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Index key too long';
        break;
      case 12134:
        errorStatusCode = HttpStatus.BAD_REQUEST;
        errorMessage = 'Index not found';
        break;
    }

    throw new HttpException(errorMessage, errorStatusCode);
  }
}
