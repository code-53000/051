import { UserPlus, Database, Menu, X } from 'lucide-react';
import { useFamilyStore } from '../../store/useFamilyStore';

interface HeaderProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onOpenDataIO: () => void;
}

export function Header({ showSidebar, onToggleSidebar, onOpenDataIO }: HeaderProps) {
  const { openMemberForm, members, engine } = useFamilyStore();
  const { min, max } = engine.getGenerationRange();

  return (
    <header className="bg-[#1a1a2e] border-b border-[#e6b325]/20 h-14 flex items-center px-4 gap-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a4e] rounded-lg transition-colors lg:hidden"
      >
        {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#e6b325] flex items-center justify-center">
          <span className="text-[#1a1a2e] font-bold text-lg">族</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">家族树图谱</h1>
          <p className="text-gray-500 text-xs hidden sm:block">
            {members.length > 0 ? `${min} - ${max}代 · ${members.length}人` : '本地族谱管理工具'}
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onOpenDataIO}
          className="px-3 py-2 text-gray-300 hover:text-white hover:bg-[#2a2a4e] rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">数据管理</span>
        </button>
        <button
          onClick={() => openMemberForm()}
          className="px-3 py-2 bg-[#e6b325] hover:bg-[#f0c040] text-[#1a1a2e] font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">添加成员</span>
        </button>
      </div>
    </header>
  );
}
