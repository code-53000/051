import { Search, Building2, Layers, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useFamilyStore } from '../../store/useFamilyStore';
import type { HighlightMode } from '../../types/family';

export function FilterBar() {
  const { filters, setFilters, resetFilters, engine, highlightMode, setHighlightMode, members } = useFamilyStore();

  const branches = engine.getBranches();
  const { min, max } = engine.getGenerationRange();
  const generations = Array.from({ length: max - min + 1 }, (_, i) => min + i).filter((g) => g > 0);

  const highlightModes: { value: HighlightMode; label: string; icon: typeof Eye }[] = [
    { value: 'all', label: '全部显示', icon: Eye },
    { value: 'lineal', label: '仅直系', icon: Eye },
    { value: 'collateral', label: '仅旁系', icon: EyeOff },
  ];

  return (
    <div className="bg-[#2a2a4e] border-b border-[#e6b325]/20 px-4 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名..."
            value={filters.searchText}
            onChange={(e) => setFilters({ searchText: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-[#e6b325]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e6b325] transition-colors text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#e6b325]" />
          <select
            value={filters.branch || ''}
            onChange={(e) => setFilters({ branch: e.target.value || null })}
            className="px-3 py-2 bg-[#1a1a2e] border border-[#e6b325]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#e6b325] transition-colors min-w-[120px]"
          >
            <option value="">全部分支</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#e6b325]" />
          <select
            value={filters.generation || ''}
            onChange={(e) => setFilters({ generation: e.target.value ? parseInt(e.target.value) : null })}
            className="px-3 py-2 bg-[#1a1a2e] border border-[#e6b325]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#e6b325] transition-colors min-w-[100px]"
          >
            <option value="">全部代</option>
            {generations.map((g) => (
              <option key={g} value={g}>
              第{g}代
            </option>
          ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#1a1a2e] rounded-lg p-0.5">
          {highlightModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => setHighlightMode(mode.value)}
                className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                  highlightMode === mode.value
                    ? 'bg-[#e6b325] text-[#1a1a2e]'
                    : 'text-gray-300 hover:bg-[#2a2a4e]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={resetFilters}
          className="px-3 py-2 text-gray-400 hover:text-white text-sm flex items-center gap-1 hover:bg-[#1a1a2e] rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>

        <div className="ml-auto text-gray-400 text-sm">
          共 {members.length} 人
        </div>
      </div>
    </div>
  );
}
