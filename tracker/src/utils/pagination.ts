import { APP_CONFIG } from "../config/app";
import { PaginatedResult, Pagination } from "../types";

export function getPaginationParams(query: { page?: string; limit?: string }) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(
    APP_CONFIG.MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.limit || String(APP_CONFIG.DEFAULT_PAGE_SIZE), 10))
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
