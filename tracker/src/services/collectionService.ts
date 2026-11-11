import { collectionRepository } from "../repositories/collectionRepository";
import { bookmarkRepository } from "../repositories/bookmarkRepository";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors";
import { validateRequiredString } from "../utils/validators";

export class CollectionService {
  async list(userId: number) {
    const collections = await collectionRepository.findByUserId(userId);
    return Promise.all(
      collections.map(async (c) => ({
        ...c,
        bookmarkCount: (await collectionRepository.getBookmarksInCollection(c.id)).length,
      }))
    );
  }

  async create(userId: number, input: { name: string; description?: string; isPublic?: boolean }) {
    const name = validateRequiredString(input.name, "Collection name");
    const id = await collectionRepository.create({
      userId,
      name,
      description: input.description,
      isPublic: input.isPublic,
    });
    return collectionRepository.findById(id);
  }

  async getById(userId: number, collectionId: number) {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) throw new NotFoundError("Collection");
    const ownerId = (collection as any).user_id;
    const isPublic = (collection as any).is_public === 1;
    if (ownerId !== userId && !isPublic) {
      throw new NotFoundError("Collection");
    }
    const bookmarkIds = await collectionRepository.getBookmarksInCollection(collectionId);
    const bookmarks = await Promise.all(
      bookmarkIds.map((id) => bookmarkRepository.findById(id))
    );
    return {
      ...collection,
      bookmarks: bookmarks.filter(Boolean),
    };
  }

  async update(userId: number, collectionId: number, input: Partial<{ name: string; description: string; isPublic: boolean }>) {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) throw new NotFoundError("Collection");
    if ((collection as any).user_id !== userId) {
      throw new ForbiddenError();
    }
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new ValidationError("Name cannot be empty");
    }
    await collectionRepository.update(collectionId, input);
    return collectionRepository.findById(collectionId);
  }

  async delete(userId: number, collectionId: number) {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) throw new NotFoundError("Collection");
    if ((collection as any).user_id !== userId) {
      throw new ForbiddenError();
    }
    await collectionRepository.deleteById(collectionId);
  }

  async addBookmark(userId: number, collectionId: number, bookmarkId: number) {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) throw new NotFoundError("Collection");
    if ((collection as any).user_id !== userId) {
      throw new ForbiddenError();
    }
    const bookmark = await bookmarkRepository.findById(bookmarkId);
    if (!bookmark) throw new NotFoundError("Bookmark");
    if ((bookmark as any).user_id !== userId) {
      throw new ForbiddenError();
    }
    await collectionRepository.addBookmark(collectionId, bookmarkId);
  }

  async removeBookmark(userId: number, collectionId: number, bookmarkId: number) {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) throw new NotFoundError("Collection");
    if ((collection as any).user_id !== userId) {
      throw new ForbiddenError();
    }
    await collectionRepository.removeBookmark(collectionId, bookmarkId);
  }
}

export const collectionService = new CollectionService();
