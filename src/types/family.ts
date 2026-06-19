import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export type Gender = 'male' | 'female';

export type RelationshipType = 'parent' | 'child' | 'spouse';

export type LinkType = 'parent' | 'spouse' | 'sibling';

export type KinshipType =
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'husband'
  | 'wife'
  | 'brother'
  | 'sister'
  | 'grandfather'
  | 'grandmother'
  | 'grandson'
  | 'granddaughter'
  | 'uncle'
  | 'aunt'
  | 'nephew'
  | 'niece'
  | 'cousin_male'
  | 'cousin_female'
  | 'unknown';

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  branch: string;
  generation: number;
  birthDate?: string;
  deathDate?: string;
  note?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: RelationshipType;
  createdAt: number;
}

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  member: Member;
  isExpanded: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: LinkType;
  isHighlighted: boolean;
  isDimmed: boolean;
}

export interface FamilyData {
  members: Member[];
  relationships: Relationship[];
}

export interface MemberWithRelatives extends Member {
  parents: Member[];
  children: Member[];
  spouse: Member | null;
  siblings: Member[];
}

export type HighlightMode = 'none' | 'lineal' | 'collateral' | 'all';

export interface FilterOptions {
  branch: string | null;
  generation: number | null;
  searchText: string;
}

export const KINSHIP_LABELS: Record<KinshipType, string> = {
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

export const BRANCH_COLORS: Record<string, string> = {
  '长房': '#6b8e8e',
  '二房': '#8b7355',
  '三房': '#6b6b8e',
  '四房': '#8e6b6b',
  '五房': '#5f8e6b',
  'default': '#888888',
};

export const GENDER_COLORS: Record<Gender, string> = {
  male: '#4a90d9',
  female: '#d94a90',
};

export const LINK_COLORS: Record<LinkType, string> = {
  parent: '#e6b325',
  spouse: '#c94c4c',
  sibling: '#6b8e8e',
};
