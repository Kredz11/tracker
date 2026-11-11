import { tagRepository } from "../repositories/tagRepository";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors";
import { validateRequiredString } from "../utils/validators";

export class TagService {
  async list(userId: number) {
    return tagRepository.findByUserId(userId);
  }

  async create(userId: number, input: { name: string; color?: string }) {
    const name = validateRequiredString(input.name, "Tag name");
    const existing = await tagRepository.findByName(userId, name);
    if (existing) {
      throw new ConflictError(`Tag "${name}" already exists`);
    }
    const tagId = await tagRepository.create({ userId, name, color: input.color });
    return tagRepository.findById(tagId);
  }

  async delete(userId: number, tagId: number) {
    const tag = await tagRepository.findById(tagId);
    if (!tag) throw new NotFoundError("Tag");
    if ((tag as any).user_id !== userId) {
      throw new NotFoundError("Tag");
    }
    await tagRepository.deleteById(tagId);
  }
}

export const tagService = new TagService();
