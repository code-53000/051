import type { Member, Relationship } from '../types/family';

interface MemberNode {
  id: string;
  generation: number;
  visited: boolean;
}

export function calculateGenerations(
  members: Member[],
  relationships: Relationship[]
): Map<string, number> {
  const generationMap = new Map<string, number>();
  const nodes = new Map<string, MemberNode>();
  const parentMap = new Map<string, string[]>();
  const childMap = new Map<string, string[]>();

  members.forEach((m) => {
    nodes.set(m.id, { id: m.id, generation: m.generation || 0, visited: false });
    parentMap.set(m.id, []);
    childMap.set(m.id, []);
  });

  relationships.forEach((r) => {
    if (r.type === 'parent') {
      const children = childMap.get(r.fromId) || [];
      children.push(r.toId);
      childMap.set(r.fromId, children);

      const parents = parentMap.get(r.toId) || [];
      parents.push(r.fromId);
      parentMap.set(r.toId, parents);
    }
  });

  const roots = members.filter((m) => {
    const parents = parentMap.get(m.id) || [];
    return parents.length === 0;
  });

  const queue: string[] = [];
  roots.forEach((root) => {
    const node = nodes.get(root.id)!;
    node.generation = 1;
    node.visited = true;
    queue.push(root.id);
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = nodes.get(currentId)!;
    const children = childMap.get(currentId) || [];

    children.forEach((childId) => {
      const childNode = nodes.get(childId)!;
      if (!childNode.visited) {
        childNode.generation = currentNode.generation + 1;
        childNode.visited = true;
        queue.push(childId);
      }
    });
  }

  members.forEach((m) => {
    const node = nodes.get(m.id)!;
    generationMap.set(m.id, node.generation || m.generation || 1);
  });

  return generationMap;
}

export function getGenerationRange(members: Member[]): { min: number; max: number } {
  if (members.length === 0) {
    return { min: 1, max: 1 };
  }
  const generations = members.map((m) => m.generation);
  return {
    min: Math.min(...generations),
    max: Math.max(...generations),
  };
}

export function getGenerationLabel(generation: number): string {
  const labels = ['', '一世', '二世', '三世', '四世', '五世', '六世', '七世', '八世', '九世', '十世'];
  return labels[generation] || `${generation}世`;
}
