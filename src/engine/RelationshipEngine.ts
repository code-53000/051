import type {
  Member,
  Relationship,
  KinshipType,
  MemberWithRelatives,
  FilterOptions,
  HighlightMode,
  GraphNode,
  GraphLink,
  LinkType,
} from '../types/family';
import {
  determineKinship,
  getLinealRelatives,
  getCollateralRelatives,
  getAllRelatives,
  getMemberWithRelatives,
  getRelationshipMap,
} from './kinship';
import { getFilteredGraphData, getSubtreeMembers } from './filters';
import { calculateGenerations, getGenerationLabel, getGenerationRange } from './generation';

export class RelationshipEngine {
  private members: Member[] = [];
  private relationships: Relationship[] = [];
  private memberMap = new Map<string, Member>();
  private generationCache = new Map<string, number>();
  private kinshipCache = new Map<string, KinshipType | null>();

  constructor(members: Member[] = [], relationships: Relationship[] = []) {
    this.setData(members, relationships);
  }

  setData(members: Member[], relationships: Relationship[]): void {
    this.members = members;
    this.relationships = relationships;
    this.memberMap = new Map(members.map((m) => [m.id, m]));
    this.generationCache = calculateGenerations(members, relationships);
    this.kinshipCache.clear();
  }

  getMembers(): Member[] {
    return this.members;
  }

  getRelationships(): Relationship[] {
    return this.relationships;
  }

  getMemberById(id: string): Member | undefined {
    return this.memberMap.get(id);
  }

  getBranches(): string[] {
    const branches = new Set(this.members.map((m) => m.branch));
    return Array.from(branches).sort();
  }

  getGenerations(): number[] {
    const generations = new Set(this.members.map((m) => m.generation));
    return Array.from(generations).sort((a, b) => a - b);
  }

  getGenerationRange(): { min: number; max: number } {
    return getGenerationRange(this.members);
  }

  getGenerationLabel(gen: number): string {
    return getGenerationLabel(gen);
  }

  getParents(memberId: string): Member[] {
    const relMap = getRelationshipMap(this.members, this.relationships);
    return (relMap.parents.get(memberId) || [])
      .map((id) => this.memberMap.get(id)!)
      .filter(Boolean);
  }

  getChildren(memberId: string): Member[] {
    const relMap = getRelationshipMap(this.members, this.relationships);
    return (relMap.children.get(memberId) || [])
      .map((id) => this.memberMap.get(id)!)
      .filter(Boolean);
  }

  getSpouse(memberId: string): Member | null {
    const relMap = getRelationshipMap(this.members, this.relationships);
    const spouses = (relMap.spouses.get(memberId) || [])
      .map((id) => this.memberMap.get(id)!)
      .filter(Boolean);
    return spouses[0] || null;
  }

  getSiblings(memberId: string): Member[] {
    const parents = this.getParents(memberId);
    const siblings = new Set<Member>();

    parents.forEach((parent) => {
      const parentChildren = this.getChildren(parent.id);
      parentChildren.forEach((child) => {
        if (child.id !== memberId) {
          siblings.add(child);
        }
      });
    });

    return Array.from(siblings);
  }

  getKinship(memberId1: string, memberId2: string): KinshipType | null {
    const cacheKey = `${memberId1}-${memberId2}`;
    if (this.kinshipCache.has(cacheKey)) {
      return this.kinshipCache.get(cacheKey)!;
    }

    const result = determineKinship(
      memberId1,
      memberId2,
      this.members,
      this.relationships
    );

    this.kinshipCache.set(cacheKey, result);
    return result;
  }

  getKinshipLabel(memberId1: string, memberId2: string): string {
    const kinship = this.getKinship(memberId1, memberId2);
    if (!kinship) return '';

    const labels: Record<KinshipType, string> = {
      father: '父亲',
      mother: '母亲',
      son: '儿子',
      daughter: '女儿',
      husband: '丈夫',
      wife: '妻子',
      brother: '兄弟',
      sister: '姐妹',
      grandfather: '祖父',
      grandmother: '祖母',
      grandson: '孙子',
      granddaughter: '孙女',
      uncle: '叔伯',
      aunt: '姑母',
      nephew: '侄子',
      niece: '侄女',
      cousin_male: '表兄弟',
      cousin_female: '表姐妹',
      unknown: '未知',
    };

    return labels[kinship] || kinship;
  }

  getLinealRelatives(memberId: string, depth: number = 3): Set<string> {
    return getLinealRelatives(memberId, this.members, this.relationships, depth);
  }

  getCollateralRelatives(memberId: string): Set<string> {
    return getCollateralRelatives(memberId, this.members, this.relationships);
  }

  getAllRelatives(memberId: string): Set<string> {
    return getAllRelatives(memberId, this.members, this.relationships);
  }

  getMemberWithRelatives(memberId: string): MemberWithRelatives | null {
    return getMemberWithRelatives(memberId, this.members, this.relationships);
  }

  getSubtreeMembers(rootId: string, includeSpouses: boolean = true): Set<string> {
    return getSubtreeMembers(rootId, this.members, this.relationships, includeSpouses);
  }

  filterMembers(filters: FilterOptions): Member[] {
    const { visibleMembers } = getFilteredGraphData(
      this.members,
      this.relationships,
      filters
    );
    return this.members.filter((m) => visibleMembers.has(m.id));
  }

  buildGraphData(
    filters: FilterOptions,
    expandedNodes: Set<string>,
    highlightedNodeId: string | null,
    highlightMode: HighlightMode
  ): { nodes: GraphNode[]; links: GraphLink[] } {
    const { visibleMembers, visibleRelationships } = getFilteredGraphData(
      this.members,
      this.relationships,
      filters
    );

    const collapseHidden = new Set<string>();
    expandedNodes.forEach((expandedId) => {
      const subtree = this.getSubtreeMembers(expandedId, true);
      subtree.forEach((id) => collapseHidden.delete(id));
    });

    this.members.forEach((m) => {
      if (m.generation <= 2) {
        expandedNodes.add(m.id);
      }
    });

    const nodes: GraphNode[] = this.members
      .filter((m) => visibleMembers.has(m.id))
      .map((m) => {
        const isExpanded = expandedNodes.has(m.id);
        let isHighlighted = false;
        let isDimmed = false;

        if (highlightedNodeId) {
          const relatives = this.getHighlightedRelatives(highlightedNodeId, highlightMode);
          isHighlighted = relatives.has(m.id) || m.id === highlightedNodeId;
          isDimmed = !isHighlighted;
        }

        return {
          id: m.id,
          member: m,
          isExpanded,
          isHighlighted,
          isDimmed,
        };
      });

    const linkMap = new Map<string, GraphLink>();

    visibleRelationships.forEach((rel) => {
      if (!visibleMembers.has(rel.fromId) || !visibleMembers.has(rel.toId)) {
        return;
      }

      let linkType: LinkType | null = null;
      if (rel.type === 'parent') {
        linkType = 'parent';
      } else if (rel.type === 'spouse') {
        linkType = 'spouse';
      }

      if (linkType) {
        const keyParts = [rel.fromId, rel.toId].sort();
        const key = `${keyParts[0]}-${keyParts[1]}-${linkType}`;

        if (!linkMap.has(key)) {
          let isHighlighted = false;
          let isDimmed = false;

          if (highlightedNodeId) {
            const relatives = this.getHighlightedRelatives(highlightedNodeId, highlightMode);
            isHighlighted =
              (relatives.has(rel.fromId) || rel.fromId === highlightedNodeId) &&
              (relatives.has(rel.toId) || rel.toId === highlightedNodeId);
            isDimmed = !isHighlighted;
          }

          linkMap.set(key, {
            id: key,
            source: rel.fromId,
            target: rel.toId,
            type: linkType,
            isHighlighted,
            isDimmed,
          });
        }
      }
    });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const siblingsAdded = new Set<string>();

    this.members.forEach((m) => {
      if (!visibleMembers.has(m.id)) return;

      const siblings = this.getSiblings(m.id);
      siblings.forEach((sibling) => {
        if (!visibleMembers.has(sibling.id)) return;

        const keyParts = [m.id, sibling.id].sort();
        const key = `${keyParts[0]}-${keyParts[1]}-sibling`;

        if (!linkMap.has(key) && !siblingsAdded.has(key)) {
          let isHighlighted = false;
          let isDimmed = false;

          if (highlightedNodeId) {
            const relatives = this.getHighlightedRelatives(highlightedNodeId, highlightMode);
            isHighlighted =
              (relatives.has(m.id) || m.id === highlightedNodeId) &&
              (relatives.has(sibling.id) || sibling.id === highlightedNodeId);
            isDimmed = !isHighlighted;
          }

          if (nodeIds.has(m.id) && nodeIds.has(sibling.id)) {
            linkMap.set(key, {
              id: key,
              source: m.id,
              target: sibling.id,
              type: 'sibling',
              isHighlighted,
              isDimmed,
            });
            siblingsAdded.add(key);
          }
        }
      });
    });

    const links = Array.from(linkMap.values()).filter(
      (link) =>
        nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id) &&
        nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
    );

    return { nodes, links };
  }

  private getHighlightedRelatives(
    memberId: string,
    mode: HighlightMode
  ): Set<string> {
    switch (mode) {
      case 'lineal':
        return this.getLinealRelatives(memberId, 3);
      case 'collateral':
        return this.getCollateralRelatives(memberId);
      case 'all':
        return this.getAllRelatives(memberId);
      default:
        return new Set();
    }
  }

  clearCache(): void {
    this.kinshipCache.clear();
    this.generationCache.clear();
  }
}
