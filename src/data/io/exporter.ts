import type { FamilyData, Member, Relationship } from '../../types/family';

export function exportToJSON(data: FamilyData): string {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(exportData, null, 2);
}

export function downloadJSON(data: FamilyData, filename?: string): void {
  const jsonStr = exportToJSON(data);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `family-tree-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportMembersToCSV(members: Member[]): string {
  const headers = ['ID', '姓名', '性别', '分支', '代数', '出生日期', '去世日期', '备注'];
  const rows = members.map((m) => [
    m.id,
    m.name,
    m.gender === 'male' ? '男' : '女',
    m.branch,
    m.generation,
    m.birthDate || '',
    m.deathDate || '',
    m.note || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

export function exportRelationshipsToCSV(relationships: Relationship[]): string {
  const headers = ['ID', '成员A', '成员B', '关系类型', '创建时间'];
  const typeLabels: Record<string, string> = {
    parent: '父母',
    child: '子女',
    spouse: '配偶',
  };
  const rows = relationships.map((r) => [
    r.id,
    r.fromId,
    r.toId,
    typeLabels[r.type] || r.type,
    new Date(r.createdAt).toLocaleString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
