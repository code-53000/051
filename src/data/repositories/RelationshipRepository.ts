import { initDB, STORES } from '../db';
import type { Relationship, RelationshipType } from '../../types/family';

function generateId(): string {
  return `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface CreateRelationshipInput {
  fromId: string;
  toId: string;
  type: RelationshipType;
}

export class RelationshipRepository {
  static async create(input: CreateRelationshipInput): Promise<Relationship> {
    const db = await initDB();
    const relationship: Relationship = {
      id: generateId(),
      fromId: input.fromId,
      toId: input.toId,
      type: input.type,
      createdAt: Date.now(),
    };
    await db.add(STORES.RELATIONSHIPS, relationship);
    return relationship;
  }

  static async addParentChild(parentId: string, childId: string): Promise<Relationship[]> {
    return Promise.all([
      this.create({ fromId: parentId, toId: childId, type: 'parent' }),
      this.create({ fromId: childId, toId: parentId, type: 'child' }),
    ]);
  }

  static async addSpouse(spouse1Id: string, spouse2Id: string): Promise<Relationship[]> {
    return Promise.all([
      this.create({ fromId: spouse1Id, toId: spouse2Id, type: 'spouse' }),
      this.create({ fromId: spouse2Id, toId: spouse1Id, type: 'spouse' }),
    ]);
  }

  static async delete(id: string): Promise<boolean> {
    const db = await initDB();
    await db.delete(STORES.RELATIONSHIPS, id);
    return true;
  }

  static async deleteByMember(memberId: string): Promise<void> {
    const db = await initDB();
    const all = await this.getAll();
    const toDelete = all.filter(
      (r) => r.fromId === memberId || r.toId === memberId
    );
    const tx = db.transaction(STORES.RELATIONSHIPS, 'readwrite');
    for (const rel of toDelete) {
      await tx.store.delete(rel.id);
    }
    await tx.done;
  }

  static async removeParentChild(parentId: string, childId: string): Promise<void> {
    const db = await initDB();
    const all = await this.getAll();
    const toDelete = all.filter(
      (r) =>
        (r.fromId === parentId && r.toId === childId && r.type === 'parent') ||
        (r.fromId === childId && r.toId === parentId && r.type === 'child')
    );
    const tx = db.transaction(STORES.RELATIONSHIPS, 'readwrite');
    for (const rel of toDelete) {
      await tx.store.delete(rel.id);
    }
    await tx.done;
  }

  static async removeSpouse(spouse1Id: string, spouse2Id: string): Promise<void> {
    const db = await initDB();
    const all = await this.getAll();
    const toDelete = all.filter(
      (r) =>
        (r.fromId === spouse1Id && r.toId === spouse2Id && r.type === 'spouse') ||
        (r.fromId === spouse2Id && r.toId === spouse1Id && r.type === 'spouse')
    );
    const tx = db.transaction(STORES.RELATIONSHIPS, 'readwrite');
    for (const rel of toDelete) {
      await tx.store.delete(rel.id);
    }
    await tx.done;
  }

  static async getById(id: string): Promise<Relationship | null> {
    const db = await initDB();
    const result = await db.get(STORES.RELATIONSHIPS, id);
    return result || null;
  }

  static async getAll(): Promise<Relationship[]> {
    const db = await initDB();
    return db.getAll(STORES.RELATIONSHIPS);
  }

  static async getByFromId(fromId: string): Promise<Relationship[]> {
    const db = await initDB();
    return db.getAllFromIndex(STORES.RELATIONSHIPS, 'fromId', fromId);
  }

  static async getByToId(toId: string): Promise<Relationship[]> {
    const db = await initDB();
    return db.getAllFromIndex(STORES.RELATIONSHIPS, 'toId', toId);
  }

  static async getByMember(memberId: string): Promise<Relationship[]> {
    const all = await this.getAll();
    return all.filter((r) => r.fromId === memberId || r.toId === memberId);
  }

  static async getByType(type: RelationshipType): Promise<Relationship[]> {
    const db = await initDB();
    return db.getAllFromIndex(STORES.RELATIONSHIPS, 'type', type);
  }

  static async bulkCreate(relationships: CreateRelationshipInput[]): Promise<Relationship[]> {
    const db = await initDB();
    const now = Date.now();
    const tx = db.transaction(STORES.RELATIONSHIPS, 'readwrite');
    const results: Relationship[] = [];

    for (const input of relationships) {
      const rel: Relationship = {
        id: generateId(),
        ...input,
        createdAt: now,
      };
      await tx.store.add(rel);
      results.push(rel);
    }

    await tx.done;
    return results;
  }

  static async bulkUpsert(relationships: Relationship[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(STORES.RELATIONSHIPS, 'readwrite');

    for (const rel of relationships) {
      await tx.store.put(rel);
    }

    await tx.done;
  }
}
