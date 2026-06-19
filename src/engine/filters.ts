import type { Member, Relationship, FilterOptions } from '../types/family';
import { getRelationshipMap } from './kinship';

export function filterByBranch(
  members: Member[],
  branch: string
): Member[] {
  return members.filter((m) => m.branch === branch);
}

export function filterByGeneration(
  members: Member[],
  generation: number
): Member[] {
  return members.filter((m) => m.generation === generation);
}

export function filterByBranchAndGeneration(
  members: Member[],
  branch: string,
  generation: number
): Member[] {
  return members.filter((m) => m.branch === branch && m.generation === generation);
}

export function searchByName(
  members: Member[],
  searchText: string
): Member[] {
  if (!searchText.trim()) return members;
  const lowerText = searchText.toLowerCase().trim();
  return members.filter((m) => m.name.toLowerCase().includes(lowerText));
}

export function applyFilters(
  members: Member[],
  filters: FilterOptions
): Member[] {
  let result = [...members];

  if (filters.branch) {
    result = filterByBranch(result, filters.branch);
  }

  if (filters.generation !== null) {
    result = filterByGeneration(result, filters.generation);
  }

  if (filters.searchText) {
    result = searchByName(result, filters.searchText);
  }

  return result;
}

export function getBranchMembers(
  branch: string,
  members: Member[],
  relationships: Relationship[]
): Set<string> {
  const branchMembers = new Set<string>();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const relMap = getRelationshipMap(members, relationships);

  const directMembers = members.filter((m) => m.branch === branch);
  directMembers.forEach((m) => branchMembers.add(m.id));

  const queue = [...directMembers.map((m) => m.id)];
  const visited = new Set(queue);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const current = memberMap.get(currentId);
    if (!current) continue;

    const spouses = relMap.spouses.get(currentId) || [];
    spouses.forEach((spouseId) => {
      branchMembers.add(spouseId);
      if (!visited.has(spouseId)) {
        visited.add(spouseId);
        queue.push(spouseId);
      }
    });
  }

  return branchMembers;
}

export function getGenerationMembers(
  generation: number,
  members: Member[],
  relationships: Relationship[]
): Set<string> {
  const genMembers = new Set<string>();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const relMap = getRelationshipMap(members, relationships);

  const directMembers = members.filter((m) => m.generation === generation);
  directMembers.forEach((m) => genMembers.add(m.id));

  const queue = [...directMembers.map((m) => m.id)];
  const visited = new Set(queue);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const current = memberMap.get(currentId);
    if (!current) continue;

    const spouses = relMap.spouses.get(currentId) || [];
    spouses.forEach((spouseId) => {
      genMembers.add(spouseId);
      if (!visited.has(spouseId)) {
        visited.add(spouseId);
        queue.push(spouseId);
      }
    });
  }

  return genMembers;
}

export function getSubtreeMembers(
  rootMemberId: string,
  members: Member[],
  relationships: Relationship[],
  includeSpouses: boolean = true
): Set<string> {
  const subtree = new Set<string>([rootMemberId]);
  const relMap = getRelationshipMap(members, relationships);
  const queue = [rootMemberId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    const children = relMap.children.get(currentId) || [];
    children.forEach((childId) => {
      if (!subtree.has(childId)) {
        subtree.add(childId);
        queue.push(childId);

        if (includeSpouses) {
          const childSpouses = relMap.spouses.get(childId) || [];
          childSpouses.forEach((spouseId) => {
            if (!subtree.has(spouseId)) {
              subtree.add(spouseId);
            }
          });
        }
      }
    });

    if (includeSpouses) {
      const spouses = relMap.spouses.get(currentId) || [];
      spouses.forEach((spouseId) => {
        if (!subtree.has(spouseId)) {
          subtree.add(spouseId);
        }
      });
    }
  }

  return subtree;
}

export function getFilteredGraphData(
  members: Member[],
  relationships: Relationship[],
  filters: FilterOptions
): {
  visibleMembers: Set<string>;
  visibleRelationships: Relationship[];
} {
  const filteredMembers = applyFilters(members, filters);
  const visibleIds = new Set<string>();

  if (filters.branch) {
    const branchIds = getBranchMembers(filters.branch, members, relationships);
    filteredMembers.forEach((m) => visibleIds.add(m.id));
    branchIds.forEach((id) => visibleIds.add(id));
  } else if (filters.generation !== null) {
    const genIds = getGenerationMembers(filters.generation, members, relationships);
    filteredMembers.forEach((m) => visibleIds.add(m.id));
    genIds.forEach((id) => visibleIds.add(id));
  } else if (filters.searchText) {
    const searchIds = new Set(filteredMembers.map((m) => m.id));
    const relMap = getRelationshipMap(members, relationships);

    searchIds.forEach((id) => {
      visibleIds.add(id);
      relMap.parents.get(id)?.forEach((pid) => visibleIds.add(pid));
      relMap.children.get(id)?.forEach((cid) => visibleIds.add(cid));
      relMap.spouses.get(id)?.forEach((sid) => visibleIds.add(sid));
    });
  } else {
    members.forEach((m) => visibleIds.add(m.id));
  }

  const visibleRelationships = relationships.filter(
    (r) => visibleIds.has(r.fromId) && visibleIds.has(r.toId)
  );

  return { visibleMembers: visibleIds, visibleRelationships };
}
