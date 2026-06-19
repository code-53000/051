import type { Member, Relationship, KinshipType } from '../types/family';

interface RelationshipMap {
  parents: Map<string, string[]>;
  children: Map<string, string[]>;
  spouses: Map<string, string[]>;
}

function buildRelationshipMap(
  members: Member[],
  relationships: Relationship[]
): RelationshipMap {
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  const spouses = new Map<string, string[]>();

  members.forEach((m) => {
    parents.set(m.id, []);
    children.set(m.id, []);
    spouses.set(m.id, []);
  });

  relationships.forEach((r) => {
    if (r.type === 'parent') {
      const pList = parents.get(r.toId) || [];
      if (!pList.includes(r.fromId)) pList.push(r.fromId);
      parents.set(r.toId, pList);

      const cList = children.get(r.fromId) || [];
      if (!cList.includes(r.toId)) cList.push(r.toId);
      children.set(r.fromId, cList);
    } else if (r.type === 'spouse') {
      const sList1 = spouses.get(r.fromId) || [];
      if (!sList1.includes(r.toId)) sList1.push(r.toId);
      spouses.set(r.fromId, sList1);

      const sList2 = spouses.get(r.toId) || [];
      if (!sList2.includes(r.fromId)) sList2.push(r.fromId);
      spouses.set(r.toId, sList2);
    }
  });

  return { parents, children, spouses };
}

function getSiblings(
  memberId: string,
  relMap: RelationshipMap
): string[] {
  const parents = relMap.parents.get(memberId) || [];
  const siblings = new Set<string>();

  parents.forEach((parentId) => {
    const parentChildren = relMap.children.get(parentId) || [];
    parentChildren.forEach((childId) => {
      if (childId !== memberId) {
        siblings.add(childId);
      }
    });
  });

  return Array.from(siblings);
}

function findPath(
  startId: string,
  endId: string,
  relMap: RelationshipMap,
  maxDepth: number = 5
): { path: string[]; types: string[] } | null {
  if (startId === endId) return { path: [startId], types: [] };

  const visited = new Set<string>();
  const queue: Array<{ id: string; path: string[]; types: string[] }> = [
    { id: startId, path: [startId], types: [] },
  ];

  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.path.length > maxDepth) continue;

    const parents = relMap.parents.get(current.id) || [];
    for (const parentId of parents) {
      if (parentId === endId) {
        return {
          path: [...current.path, parentId],
          types: [...current.types, 'parent'],
        };
      }
      if (!visited.has(parentId)) {
        visited.add(parentId);
        queue.push({
          id: parentId,
          path: [...current.path, parentId],
          types: [...current.types, 'parent'],
        });
      }
    }

    const children = relMap.children.get(current.id) || [];
    for (const childId of children) {
      if (childId === endId) {
        return {
          path: [...current.path, childId],
          types: [...current.types, 'child'],
        };
      }
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push({
          id: childId,
          path: [...current.path, childId],
          types: [...current.types, 'child'],
        });
      }
    }

    const spouses = relMap.spouses.get(current.id) || [];
    for (const spouseId of spouses) {
      if (spouseId === endId) {
        return {
          path: [...current.path, spouseId],
          types: [...current.types, 'spouse'],
        };
      }
    }
  }

  return null;
}

export function determineKinship(
  memberId1: string,
  memberId2: string,
  members: Member[],
  relationships: Relationship[]
): KinshipType | null {
  if (memberId1 === memberId2) return null;

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const relMap = buildRelationshipMap(members, relationships);

  const m1 = memberMap.get(memberId1);
  const m2 = memberMap.get(memberId2);
  if (!m1 || !m2) return null;

  const path = findPath(memberId1, memberId2, relMap);
  if (!path) return 'unknown';

  const { types } = path;

  if (types.length === 1) {
    const type = types[0];
    if (type === 'parent') {
      return m2.gender === 'male' ? 'father' : 'mother';
    }
    if (type === 'child') {
      return m2.gender === 'male' ? 'son' : 'daughter';
    }
    if (type === 'spouse') {
      return m2.gender === 'male' ? 'husband' : 'wife';
    }
  }

  const siblings = getSiblings(memberId1, relMap);
  if (siblings.includes(memberId2)) {
    return m2.gender === 'male' ? 'brother' : 'sister';
  }

  if (types.length === 2) {
    if (types[0] === 'parent' && types[1] === 'parent') {
      return m2.gender === 'male' ? 'grandfather' : 'grandmother';
    }
    if (types[0] === 'child' && types[1] === 'child') {
      return m2.gender === 'male' ? 'grandson' : 'granddaughter';
    }
    if (types[0] === 'parent' && types[1] === 'child') {
      return m2.gender === 'male' ? 'brother' : 'sister';
    }
  }

  if (types.length === 3) {
    if (types[0] === 'parent' && types[1] === 'parent' && types[2] === 'child') {
      const parentIds = relMap.parents.get(memberId1) || [];
      const targetParents = relMap.parents.get(memberId2) || [];
      const isParentSibling = parentIds.some((pid) => {
        const pidParents = relMap.parents.get(pid) || [];
        return targetParents.some((tp) => pidParents.includes(tp));
      });
      if (isParentSibling) {
        return m2.gender === 'male' ? 'uncle' : 'aunt';
      }
    }
    if (types[0] === 'child' && types[1] === 'child' && types[2] === 'child') {
      return m2.gender === 'male' ? 'nephew' : 'niece';
    }
  }

  const genDiff = m2.generation - m1.generation;

  if (genDiff === 0) {
    const m1Parents = relMap.parents.get(memberId1) || [];
    const m2Parents = relMap.parents.get(memberId2) || [];

    const m1Grandparents = new Set<string>();
    m1Parents.forEach((p) => {
      relMap.parents.get(p)?.forEach((gp) => m1Grandparents.add(gp));
    });

    const m2Grandparents = new Set<string>();
    m2Parents.forEach((p) => {
      relMap.parents.get(p)?.forEach((gp) => m2Grandparents.add(gp));
    });

    const hasCommonGrandparent = Array.from(m1Grandparents).some((gp) =>
      m2Grandparents.has(gp)
    );

    if (hasCommonGrandparent) {
      return m2.gender === 'male' ? 'cousin_male' : 'cousin_female';
    }
  }

  if (genDiff === 1) {
    const m1Parents = relMap.parents.get(memberId1) || [];
    const m1Grandparents = new Set<string>();
    m1Parents.forEach((p) => {
      relMap.parents.get(p)?.forEach((gp) => m1Grandparents.add(gp));
    });

    const m2Children = relMap.children.get(memberId2) || [];
    if (m2Children.some((c) => m1Grandparents.has(c))) {
      return m2.gender === 'male' ? 'uncle' : 'aunt';
    }
  }

  if (genDiff === -1) {
    const m2Parents = relMap.parents.get(memberId2) || [];
    const m2Grandparents = new Set<string>();
    m2Parents.forEach((p) => {
      relMap.parents.get(p)?.forEach((gp) => m2Grandparents.add(gp));
    });

    const m1Children = relMap.children.get(memberId1) || [];
    if (m1Children.some((c) => m2Grandparents.has(c))) {
      return m2.gender === 'male' ? 'nephew' : 'niece';
    }
  }

  return 'unknown';
}

export function getLinealRelatives(
  memberId: string,
  members: Member[],
  relationships: Relationship[],
  depth: number = 3
): Set<string> {
  const relMap = buildRelationshipMap(members, relationships);
  const result = new Set<string>([memberId]);

  function collectUp(id: string, currentDepth: number) {
    if (currentDepth > depth) return;
    const parents = relMap.parents.get(id) || [];
    parents.forEach((pid) => {
      result.add(pid);
      collectUp(pid, currentDepth + 1);
    });
  }

  function collectDown(id: string, currentDepth: number) {
    if (currentDepth > depth) return;
    const children = relMap.children.get(id) || [];
    children.forEach((cid) => {
      result.add(cid);
      collectDown(cid, currentDepth + 1);
    });
  }

  collectUp(memberId, 1);
  collectDown(memberId, 1);

  const memberMap = new Map(members.map((m) => [m.id, m]));
  const member = memberMap.get(memberId);
  if (member) {
    relMap.spouses.get(memberId)?.forEach((spouseId) => {
      result.add(spouseId);
    });
  }

  return result;
}

export function getCollateralRelatives(
  memberId: string,
  members: Member[],
  relationships: Relationship[]
): Set<string> {
  const lineal = getLinealRelatives(memberId, members, relationships, 3);
  const allIds = new Set(members.map((m) => m.id));
  const collateral = new Set<string>();

  allIds.forEach((id) => {
    if (!lineal.has(id)) {
      const kinship = determineKinship(memberId, id, members, relationships);
      if (kinship && kinship !== 'unknown') {
        collateral.add(id);
      }
    }
  });

  return collateral;
}

export function getAllRelatives(
  memberId: string,
  members: Member[],
  relationships: Relationship[]
): Set<string> {
  const lineal = getLinealRelatives(memberId, members, relationships, 3);
  const collateral = getCollateralRelatives(memberId, members, relationships);
  return new Set([...lineal, ...collateral]);
}

export function getMemberWithRelatives(
  memberId: string,
  members: Member[],
  relationships: Relationship[]
) {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const relMap = buildRelationshipMap(members, relationships);
  const member = memberMap.get(memberId);

  if (!member) return null;

  const parents = (relMap.parents.get(memberId) || [])
    .map((id) => memberMap.get(id)!)
    .filter(Boolean);

  const children = (relMap.children.get(memberId) || [])
    .map((id) => memberMap.get(id)!)
    .filter(Boolean);

  const spouse = (relMap.spouses.get(memberId) || [])
    .map((id) => memberMap.get(id)!)
    .filter(Boolean)[0] || null;

  const siblings = getSiblings(memberId, relMap)
    .map((id) => memberMap.get(id)!)
    .filter(Boolean);

  return {
    ...member,
    parents,
    children,
    spouse,
    siblings,
  };
}

export function getRelationshipMap(
  members: Member[],
  relationships: Relationship[]
): RelationshipMap {
  return buildRelationshipMap(members, relationships);
}
