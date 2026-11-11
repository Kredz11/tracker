import { describe, it, expect } from "vitest";
import { getPaginationParams, buildPaginatedResult } from "../../../src/utils/pagination";

describe("pagination", () => {
  it("returns defaults", () => {
    const result = getPaginationParams({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it("parses page and limit", () => {
    const result = getPaginationParams({ page: "3", limit: "5" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(5);
    expect(result.offset).toBe(10);
  });

  it("clamps negative values", () => {
    const result = getPaginationParams({ page: "-1", limit: "-5" });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
  });

  it("enforces max page size", () => {
    const result = getPaginationParams({ limit: "500" });
    expect(result.limit).toBe(100);
  });

  it("builds paginated result", () => {
    const result = buildPaginatedResult([1, 2], 20, 1, 10);
    expect(result.pagination.total).toBe(20);
    expect(result.pagination.totalPages).toBe(2);
  });
});
