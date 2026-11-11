import { bookmarkRepository } from "../repositories/bookmarkRepository";
import { tagRepository } from "../repositories/tagRepository";
import { collectionRepository } from "../repositories/collectionRepository";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/errors";
import { validateUrl, validateRequiredString } from "../utils/validators";
import { CreateBookmarkInput, UpdateBookmarkInput, SearchFilters, PaginatedResult } from "../types";
import { buildPaginatedResult } from "../utils/pagination";

export class BookmarkService {
  async list(userId: number, page: number, limit: number): Promise<PaginatedResult<Record<string, unknown>>> {
    const offset = (page - 1) * limit;
    const { rows, total } = await bookmarkRepository.findByUserId(userId, offset, limit);
    const data = await Promise.all(rows.map((b) => this.enrich(b)));
    return buildPaginatedResult(data, total, page, limit);
  }

  async create(userId: number, input: CreateBookmarkInput) {
    const url = validateRequiredString(input.url, "URL");
    // BUG: no title validation on create — empty strings accepted
    const title = input.title || "";
    validateUrl(url);

    const bookmarkId = await bookmarkRepository.create({
      userId,
      url,
      title,
      description: input.description,
    });

    if (input.tagIds && input.tagIds.length > 0) {
      for (const tagId of input.tagIds) {
        await tagRepository.attachTag(bookmarkId, tagId);
      }
    }

    if (input.collectionIds && input.collectionIds.length > 0) {
      for (const collectionId of input.collectionIds) {
        await collectionRepository.addBookmark(collectionId, bookmarkId);
      }
    }

    const bookmark = await bookmarkRepository.findById(bookmarkId);
    return this.enrich(bookmark!);
  }

  async getById(userId: number, bookmarkId: number) {
    const bookmark = await bookmarkRepository.findById(bookmarkId);
    if (!bookmark) throw new NotFoundError("Bookmark");
    // BUG: missing ownership check — any authenticated user can read any bookmark
    return this.enrich(bookmark);
  }

  async update(userId: number, bookmarkId: number, input: UpdateBookmarkInput) {
    const bookmark = await bookmarkRepository.findById(bookmarkId);
    if (!bookmark) throw new NotFoundError("Bookmark");
    if ((bookmark as any).user_id !== userId) {
      throw new ForbiddenError();
    }

    if (input.title !== undefined && input.title.trim().length === 0) {
      throw new ValidationError("Title cannot be empty");
    }

    await bookmarkRepository.update(bookmarkId, {
      title: input.title,
      description: input.description,
      isArchived: input.isArchived,
      isFavorite: input.isFavorite,
    });

    if (input.tagIds !== undefined) {
      await tagRepository.detachAllTags(bookmarkId);
      for (const tagId of input.tagIds) {
        await tagRepository.attachTag(bookmarkId, tagId);
      }
    }

    const updated = await bookmarkRepository.findById(bookmarkId);
    return this.enrich(updated!);
  }

  async delete(userId: number, bookmarkId: number) {
    const bookmark = await bookmarkRepository.findById(bookmarkId);
    if (!bookmark) throw new NotFoundError("Bookmark");
    if ((bookmark as any).user_id !== userId) {
      throw new ForbiddenError();
    }
    await bookmarkRepository.deleteById(bookmarkId);
  }

  async search(userId: number, filters: SearchFilters, page: number, limit: number): Promise<PaginatedResult<Record<string, unknown>>> {
    const offset = (page - 1) * limit;
    const { rows, total } = await bookmarkRepository.search(userId, filters, offset, limit);
    const data = await Promise.all(rows.map((b) => this.enrich(b)));
    return buildPaginatedResult(data, total, page, limit);
  }

  async recordClick(userId: number, bookmarkId: number) {
    const bookmark = await bookmarkRepository.findById(bookmarkId);
    if (!bookmark) throw new NotFoundError("Bookmark");
    if ((bookmark as any).user_id !== userId) {
      throw new ForbiddenError();
    }
    await bookmarkRepository.incrementClickCount(bookmarkId);
  }

  private async enrich(bookmark: Record<string, unknown>): Promise<Record<string, unknown>> {
    const tags = await tagRepository.getTagsForBookmark(bookmark.id as number);
    return {
      id: bookmark.id,
      userId: bookmark.user_id,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      favicon: bookmark.favicon,
      isArchived: bookmark.is_archived === 1,
      isFavorite: bookmark.is_favorite === 1,
      clickCount: bookmark.click_count,
      createdAt: bookmark.created_at,
      updatedAt: bookmark.updated_at,
      tags,
    };
  }
}

export const bookmarkService = new BookmarkService();
