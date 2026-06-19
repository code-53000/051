import { openDB, IDBPDatabase } from 'idb';
import type { Member, Relationship } from '../types/family';

const DB_NAME = 'family_tree_db';
const DB_VERSION = 1;

export const STORES = {
  MEMBERS: 'members',
  RELATIONSHIPS: 'relationships',
} as const;

let dbInstance: IDBPDatabase | null = null;

export async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
    if (!db.objectStoreNames.contains(STORES.MEMBERS)) {
      const memberStore = db.createObjectStore(STORES.MEMBERS, {
        keyPath: 'id',
      });
      memberStore.createIndex('branch', 'branch');
      memberStore.createIndex('generation', 'generation');
      memberStore.createIndex('name', 'name');
    }

    if (!db.objectStoreNames.contains(STORES.RELATIONSHIPS)) {
      const relStore = db.createObjectStore(STORES.RELATIONSHIPS, {
        keyPath: 'id',
      });
      relStore.createIndex('fromId', 'fromId');
      relStore.createIndex('toId', 'toId');
      relStore.createIndex('type', 'type');
    }
  },
});

  return dbInstance;
}

export function getDB(): IDBPDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export async function clearAllData(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction([STORES.MEMBERS, STORES.RELATIONSHIPS], 'readwrite');
  await tx.objectStore(STORES.MEMBERS).clear();
  await tx.objectStore(STORES.RELATIONSHIPS).clear();
  await tx.done;
}

export async function hasData(): Promise<boolean> {
  const db = await initDB();
  const memberCount = await db.count(STORES.MEMBERS);
  return memberCount > 0;
}

export async function exportAllData(): Promise<{
  members: Member[];
  relationships: Relationship[];
}> {
  const db = await initDB();
  const [members, relationships] = await Promise.all([
    db.getAll(STORES.MEMBERS),
    db.getAll(STORES.RELATIONSHIPS),
  ]);
  return { members, relationships };
}
