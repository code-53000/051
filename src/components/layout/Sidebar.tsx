import { MemberList } from '../ui/MemberList';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static top-14 left-0 bottom-0 w-64 bg-[#2a2a4e] border-r border-[#e6b325]/20 flex flex-col z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 border-b border-[#e6b325]/20">
          <h3 className="text-[#e6b325] font-medium text-sm">成员列表</h3>
          <p className="text-gray-500 text-xs">点击查看详情</p>
        </div>
        <MemberList />
      </aside>
    </>
  );
}
