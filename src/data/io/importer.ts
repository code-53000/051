import { MemberRepository } from '../repositories/MemberRepository';
import { RelationshipRepository } from '../repositories/RelationshipRepository';
import { clearAllData } from '../db';
import type { FamilyData, Member, Relationship } from '../../types/family';

interface ImportData extends FamilyData {
  version?: string;
  exportedAt?: string;
}

export interface ImportResult {
  success: boolean;
  membersCount: number;
  relationshipsCount: number;
  membersAdded: number;
  relationshipsAdded: number;
  errors?: string[];
}

export function parseJSON(jsonStr: string): ImportData | null {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.members || !Array.isArray(data.members)) {
      throw new Error('缺少 members 字段或格式不正确');
    }
    if (!data.relationships || !Array.isArray(data.relationships)) {
      throw new Error('缺少 relationships 字段或格式不正确');
    }
    return data;
  } catch (e) {
    console.error('JSON 解析失败:', e);
    return null;
  }
}

export function validateData(data: ImportData): string[] {
  const errors: string[] = [];
  const memberIds = new Set<string>();

  data.members.forEach((m, index) => {
    if (!m.id) {
      errors.push(`成员 ${index} 缺少 id`);
    } else {
      if (memberIds.has(m.id)) {
        errors.push(`成员 id 重复: ${m.id}`);
      }
      memberIds.add(m.id);
    }
    if (!m.name) {
      errors.push(`成员 ${m.id || index} 缺少姓名`);
    }
    if (!m.gender || !['male', 'female'].includes(m.gender)) {
      errors.push(`成员 ${m.id || index} 性别不正确`);
    }
  });

  data.relationships.forEach((r, index) => {
    if (!r.fromId || !memberIds.has(r.fromId)) {
      errors.push(`关系 ${index} 的 fromId 无效: ${r.fromId}`);
    }
    if (!r.toId || !memberIds.has(r.toId)) {
      errors.push(`关系 ${index} 的 toId 无效: ${r.toId}`);
    }
    if (!r.type || !['parent', 'child', 'spouse'].includes(r.type)) {
      errors.push(`关系 ${index} 的类型不正确: ${r.type}`);
    }
  });

  return errors;
}

export async function importData(
  data: ImportData,
  merge: boolean = false
): Promise<ImportResult> {
  const errors = validateData(data);
  if (errors.length > 0) {
    return {
      success: false,
      membersCount: 0,
      relationshipsCount: 0,
      membersAdded: 0,
      relationshipsAdded: 0,
      errors,
    };
  }

  try {
    if (!merge) {
      await clearAllData();
    }

    await MemberRepository.bulkUpsert(data.members as Member[]);
    await RelationshipRepository.bulkUpsert(data.relationships as Relationship[]);

    return {
      success: true,
      membersCount: data.members.length,
      relationshipsCount: data.relationships.length,
      membersAdded: data.members.length,
      relationshipsAdded: data.relationships.length,
    };
  } catch (e) {
    return {
      success: false,
      membersCount: 0,
      relationshipsCount: 0,
      membersAdded: 0,
      relationshipsAdded: 0,
      errors: [e instanceof Error ? e.message : '导入失败'],
    };
  }
}

export async function importFromFile(
  file: File,
  merge: boolean = false
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const data = parseJSON(content);
      if (!data) {
        resolve({
          success: false,
          membersCount: 0,
          relationshipsCount: 0,
          membersAdded: 0,
          relationshipsAdded: 0,
          errors: ['文件格式不正确'],
        });
        return;
      }
      const result = await importData(data, merge);
      resolve(result);
    };
    reader.onerror = () => {
      resolve({
        success: false,
        membersCount: 0,
        relationshipsCount: 0,
        membersAdded: 0,
        relationshipsAdded: 0,
        errors: ['文件读取失败'],
      });
    };
    reader.readAsText(file);
  });
}
