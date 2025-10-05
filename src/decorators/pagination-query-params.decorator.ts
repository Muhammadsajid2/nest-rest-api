import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGINATION_SIZE,
} from 'src/constants/controllers.constant';

export interface IPaginationQueryParams {
  page: number;
  limit: number;
  filter: { [key: string]: any };
  size: number;
  sort: string;
  offset: number;
  search: string;
  populate: string;
  populateSelect: string;
  projection: { [key: string]: number };
}

export const PaginationQueryParams = createParamDecorator(
  (data, ctx: ExecutionContext): IPaginationQueryParams => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = (parseInt(req.query.page as string) || 1) - 1;
    const size = parseInt(req.query.size as string) || DEFAULT_PAGE_SIZE;
    const search = (req.query.search as string) || '';
    const populate = (req.query.populate as string)?.trim() || '';
    const populateSelect = (req.query.populateSelect as string)?.trim() || '';
    const sort = (req.query.sort as string)?.trim() || 'createdAt:-1';
    const select = (req.query.select as string)?.trim() || ''; // New projection parameter

    const sortPattern = /^([a-zA-Z0-9]+:[0-9]+, )*([a-zA-Z0-9]+:[-0-9]+)$/;
    if (!sort.match(sortPattern))
      throw new BadRequestException('Invalid sort parameter');

    // Throw error if populateSelect is defined but populate is not and populateSelect is  not a string
    if ((populateSelect && !populate) || typeof populateSelect !== 'string') {
      throw new BadRequestException(
        'populateSelect is defined but populate is not, or populateSelect is not a string, or populateSelect is not a valid string',
      );
    }

    if (isNaN(page) || page < 0 || isNaN(size) || size < 0) {
      throw new BadRequestException('Invalid pagination params');
    }
    //   Check if page and size are valid
    if (size > MAX_PAGINATION_SIZE) {
      throw new BadRequestException(
        `Invalid pagination params: Max size is ${MAX_PAGINATION_SIZE}`,
      );
    }

    // const filterStr = JSON.stringify((req.query.filter as string) || '{}').slice(1, -1)
    const filterStr = (req.query.filter as string) || '{}';

    try {
      const filter = JSON.parse(
        filterStr
          .replace(
            /\b(gte|gt|lte|lt|in|nin|eq|ne|size|or|not|exists)\b/g,
            (match) => `$${match}`,
          )
          .replace(/\\/g, ''),
      );
      // Parse `select` to create projection object
      const projection = select
        ? select.split(',').reduce(
            (acc, field) => {
              field = field.trim();
              const isExclusion = field.startsWith('-');
              const key = isExclusion ? field.slice(1) : field;

              if (!key) return acc; // Ignore empty keys

              const newMode = isExclusion ? 0 : 1;

              // Check if we already have a conflicting projection type
              if (Object.keys(acc).length > 0) {
                const existingMode = Object.values(acc)[0]; // Get first value (1 or 0)

                if (existingMode !== newMode) {
                  throw new BadRequestException(
                    'Cannot mix inclusion and exclusion fields in projection',
                  );
                }
              }

              acc[key] = newMode;
              return acc;
            },
            {} as Record<string, number>,
          )
        : {};

      // Ensure `_id` is not included when using exclusion projection
      if (Object.values(projection)[0] === 0) {
        projection['_id'] = 0;
      }

      const limit = size;
      const offset = page * limit;
      return {
        page,
        limit,
        size,
        offset,
        sort,
        filter,
        search,
        populate,
        populateSelect,
        projection,
      };
    } catch (_err) {
      throw new BadRequestException(
        `filter ${req.query.filter} is not correctly formatted`,
      );
    }
  },
);
