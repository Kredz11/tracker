export interface User {
  id: number;
  email: string;
  passwordHash: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: number;
  userId: number;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  userId: number;
  name: string;
  color: string | null;
  createdAt: string;
}

export interface BookmarkTag {
  bookmarkId: number;
  tagId: number;
}

export interface Collection {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionBookmark {
  collectionId: number;
  bookmarkId: number;
  addedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface AuthToken {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tagIds?: number[];
  collectionIds?: number[];
}

export interface UpdateBookmarkInput {
  title?: string;
  description?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
  tagIds?: number[];
}

export interface SearchFilters {
  q?: string;
  tagId?: number;
  collectionId?: number;
  isArchived?: boolean;
  isFavorite?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "clickCount" | "title";
  sortOrder?: "asc" | "desc";
}
