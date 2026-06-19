import { create } from 'zustand';
import type { Member, Relationship, FilterOptions, HighlightMode, GraphNode, GraphLink } from '../types/family';
import { RelationshipEngine } from '../engine/RelationshipEngine';
import { MemberRepository } from '../data/repositories/MemberRepository';
import { RelationshipRepository } from '../data/repositories/RelationshipRepository';
import { importData as importDataFn, importFromFile, type ImportResult } from '../data/io/importer';
import { getSampleData } from '../data/io/sampleData';
import { downloadJSON } from '../data/io/exporter';
import { initDB, clearAllData } from '../data/db';

interface FamilyState {
  members: Member[];
  relationships: Relationship[];
  engine: RelationshipEngine;
  isLoading: boolean;
  error: string | null;

  selectedMemberId: string | null;
  highlightedMemberId: string | null;
  highlightMode: HighlightMode;
  expandedNodes: Set<string>;
  filters: FilterOptions;
  showMemberForm: boolean;
  editingMember: Member | null;

  loadData: () => Promise<void>;
  setSelectedMember: (memberId: string | null) => void;
  setHighlightedMember: (memberId: string | null) => void;
  setHighlightMode: (mode: HighlightMode) => void;
  toggleExpand: (memberId: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;

  addMember: (input: Parameters<typeof MemberRepository.create>[0]) => Promise<Member>;
  updateMember: (input: Parameters<typeof MemberRepository.update>[0]) => Promise<Member | null>;
  deleteMember: (memberId: string) => Promise<void>;

  addParentChild: (parentId: string, childId: string) => Promise<void>;
  addSpouse: (spouse1Id: string, spouse2Id: string) => Promise<void>;
  removeParentChild: (parentId: string, childId: string) => Promise<void>;
  removeSpouse: (spouse1Id: string, spouse2Id: string) => Promise<void>;

  openMemberForm: (member?: Member) => void;
  closeMemberForm: () => void;

  loadSampleData: () => Promise<ImportResult>;
  importData: (file: File, merge?: boolean) => Promise<ImportResult>;
  exportData: () => void;
  clearData: () => Promise<void>;

  getGraphData: () => { nodes: GraphNode[]; links: GraphLink[] };
}

const initialFilters: FilterOptions = {
  branch: null,
  generation: null,
  searchText: '',
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
  members: [],
  relationships: [],
  engine: new RelationshipEngine(),
  isLoading: false,
  error: null,

  selectedMemberId: null,
  highlightedMemberId: null,
  highlightMode: 'all',
  expandedNodes: new Set(),
  filters: initialFilters,
  showMemberForm: false,
  editingMember: null,

  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      await initDB();
      const [members, relationships] = await Promise.all([
        MemberRepository.getAll(),
        RelationshipRepository.getAll(),
      ]);

      const engine = new RelationshipEngine(members, relationships);

      const expandedNodes = new Set<string>();
      members.forEach((m) => {
        if (m.generation <= 2) {
          expandedNodes.add(m.id);
        }
      });

      set({ members, relationships, engine, expandedNodes, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载数据失败',
        isLoading: false,
      });
    }
  },

  setSelectedMember: (memberId) => {
    set({ selectedMemberId: memberId });
  },

  setHighlightedMember: (memberId) => {
    set({ highlightedMemberId: memberId });
  },

  setHighlightMode: (mode) => {
    set({ highlightMode: mode });
  },

  toggleExpand: (memberId) => {
    const { expandedNodes } = get();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    set({ expandedNodes: newExpanded });
  },

  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  addMember: async (input) => {
    const member = await MemberRepository.create(input);
    await get().loadData();
    return member;
  },

  updateMember: async (input) => {
    const member = await MemberRepository.update(input);
    if (member) {
      await get().loadData();
    }
    return member;
  },

  deleteMember: async (memberId) => {
    await RelationshipRepository.deleteByMember(memberId);
    await MemberRepository.delete(memberId);
    const { selectedMemberId, highlightedMemberId } = get();
    set({
      selectedMemberId: selectedMemberId === memberId ? null : selectedMemberId,
      highlightedMemberId: highlightedMemberId === memberId ? null : highlightedMemberId,
    });
    await get().loadData();
  },

  addParentChild: async (parentId, childId) => {
    await RelationshipRepository.addParentChild(parentId, childId);
    await get().loadData();
  },

  addSpouse: async (spouse1Id, spouse2Id) => {
    await RelationshipRepository.addSpouse(spouse1Id, spouse2Id);
    await get().loadData();
  },

  removeParentChild: async (parentId, childId) => {
    await RelationshipRepository.removeParentChild(parentId, childId);
    await get().loadData();
  },

  removeSpouse: async (spouse1Id, spouse2Id) => {
    await RelationshipRepository.removeSpouse(spouse1Id, spouse2Id);
    await get().loadData();
  },

  openMemberForm: (member) => {
    set({ showMemberForm: true, editingMember: member || null });
  },

  closeMemberForm: () => {
    set({ showMemberForm: false, editingMember: null });
  },

  loadSampleData: async () => {
    const sampleData = getSampleData();
    const result = await importDataFn(sampleData, false);
    if (result.success) {
      await get().loadData();
    }
    return result;
  },

  importData: async (file, merge = false) => {
    const result = await importFromFile(file, merge);
    if (result.success) {
      await get().loadData();
    }
    return result;
  },

  exportData: () => {
    const { members, relationships } = get();
    downloadJSON({ members, relationships });
  },

  clearData: async () => {
    await clearAllData();
    set({
      members: [],
      relationships: [],
      engine: new RelationshipEngine(),
      selectedMemberId: null,
      highlightedMemberId: null,
      expandedNodes: new Set(),
    });
  },

  getGraphData: () => {
    const { engine, expandedNodes, highlightedMemberId, highlightMode, filters } = get();
    return engine.buildGraphData(filters, expandedNodes, highlightedMemberId, highlightMode);
  },
}));
