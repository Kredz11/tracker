import { getDb } from "../db/connection";

export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async db() {
    return getDb();
  }

  async findById(id: number): Promise<T | undefined> {
    const db = await this.db();
    return db.get<T>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  async deleteById(id: number): Promise<boolean> {
    const db = await this.db();
    const result = await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return (result.changes ?? 0) > 0;
  }
}
