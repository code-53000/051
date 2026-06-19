import { initDB, STORES } from '../db';
import type { Member, Gender } from '../../types/family';

function generateId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface CreateMemberInput {
  name: string;
  gender: Gender;
  branch: string;
  generation: number;
  birthDate?: string;
  deathDate?: string;
  note?: string;
  avatar?: string;
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {
  id: string;
}

export class MemberRepository {
  static async create(input: CreateMemberInput): Promise<Member> {
    const db = await initDB();
    const now = Date.now();
    const member: Member = {
      id: generateId(),
      name: input.name,
      gender: input.gender,
      branch: input.branch,
      generation: input.generation,
      birthDate: input.birthDate,
      deathDate: input.deathDate,
      note: input.note,
      avatar: input.avatar,
      createdAt: now,
      updatedAt: now,
    };
    await db.add(STORES.MEMBERS, member);
    return member;
  }

  static async update(input: UpdateMemberInput): Promise<Member | null> {
    const db = await initDB();
    const existing = await db.get(STORES.MEMBERS, input.id);
    if (!existing) return null;

    const updated: Member = {
      ...existing,
      ...input,
      updatedAt: Date.now(),
    };
    await db.put(STORES.MEMBERS, updated);
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const db = await initDB();
    await db.delete(STORES.MEMBERS, id);
    return true;
  }

  static async getById(id: string): Promise<Member | null> {
    const db = await initDB();
    const result = await db.get(STORES.MEMBERS, id);
    return result || null;
  }

  static async getAll(): Promise<Member[]> {
    const db = await initDB();
    return db.getAll(STORES.MEMBERS);
  }

  static async getByBranch(branch: string): Promise<Member[]> {
    const db = await initDB();
    return db.getAllFromIndex(STORES.MEMBERS, 'branch', branch);
  }

  static async getByGeneration(generation: number): Promise<Member[]> {
    const db = await initDB();
    return db.getAllFromIndex(STORES.MEMBERS, 'generation', generation);
  }

  static async searchByName(name: string): Promise<Member[]> {
    const all = await this.getAll();
    const lowerName = name.toLowerCase();
    return all.filter((m) => m.name.toLowerCase().includes(lowerName));
  }

  static async getBranches(): Promise<string[]> {
    const all = await this.getAll();
    const branches = new Set(all.map((m) => m.branch));
    return Array.from(branches).sort();
  }

  static async getGenerations(): Promise<number[]> {
    const all = await this.getAll();
    const generations = new Set(all.map((m) => m.generation));
    return Array.from(generations).sort((a, b) => a - b);
  }

  static async bulkCreate(members: CreateMemberInput[]): Promise<Member[]> {
    const db = await initDB();
    const now = Date.now();
    const tx = db.transaction(STORES.MEMBERS, 'readwrite');
    const results: Member[] = [];

    for (const input of members) {
      const member: Member = {
        id: generateId(),
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      await tx.store.add(member);
      results.push(member);
    }

    await tx.done;
    return results;
  }

  static async bulkUpsert(members: Member[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(STORES.MEMBERS, 'readwrite');
    const now = Date.now();

    for (const member of members) {
      const updated: Member = {
        ...member,
        updatedAt: now,
      };
      await tx.store.put(updated);
    }

    await tx.done;
  }
}
