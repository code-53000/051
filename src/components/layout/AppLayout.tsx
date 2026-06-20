import { useState, useCallback } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FilterBar } from '../ui/FilterBar';
import { ForceGraph } from '../graph/ForceGraph';
import { DetailPanel } from '../ui/DetailPanel';
import { MemberForm } from '../ui/MemberForm';
import { DataIO } from '../ui/DataIO';
import { useFamilyStore } from '../../store/useFamilyStore';

export function AppLayout() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDataIO, setShowDataIO] = useState(false);

  const showMemberForm = useFamilyStore((s) => s.showMemberForm);
  const closeMemberForm = useFamilyStore((s) => s.closeMemberForm);
  const selectedMemberId = useFamilyStore((s) => s.selectedMemberId);
  const setSelectedMember = useFamilyStore((s) => s.setSelectedMember);
  const setHighlightedMember = useFamilyStore((s) => s.setHighlightedMember);
  const toggleExpand = useFamilyStore((s) => s.toggleExpand);
  const nodes = useFamilyStore((s) => s.graphNodes);
  const links = useFamilyStore((s) => s.graphLinks);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedMember(nodeId);
      setHighlightedMember(nodeId);
    },
    [setSelectedMember, setHighlightedMember]
  );

  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      toggleExpand(nodeId);
    },
    [toggleExpand]
  );

  const handleNodeHover = useCallback(
    (nodeId: string | null) => {
      setHighlightedMember(nodeId);
    },
    [setHighlightedMember]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedMember(null);
    setHighlightedMember(null);
  }, [setSelectedMember, setHighlightedMember]);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, []);

  const handleOpenDataIO = useCallback(() => {
    setShowDataIO(true);
  }, []);

  const handleCloseDataIO = useCallback(() => {
    setShowDataIO(false);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setShowSidebar(false);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1a1a2e] overflow-hidden">
      <Header
        showSidebar={showSidebar}
        onToggleSidebar={handleToggleSidebar}
        onOpenDataIO={handleOpenDataIO}
      />

      <FilterBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={showSidebar} onClose={handleCloseSidebar} />

        <main className="flex-1 relative">
          <ForceGraph
            nodes={nodes}
            links={links}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onNodeHover={handleNodeHover}
            onBackgroundClick={handleBackgroundClick}
          />

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
              <div className="text-6xl mb-4 opacity-30">🌳</div>
              <p className="text-lg">暂无族谱数据</p>
              <p className="text-sm mt-2">
                点击右上角「数据管理」加载示例数据，或「添加成员」开始创建
              </p>
            </div>
          )}
        </main>

        {selectedMemberId && <DetailPanel />}
      </div>

      {showMemberForm && <MemberForm onClose={closeMemberForm} />}
      {showDataIO && <DataIO onClose={handleCloseDataIO} />}
    </div>
  );
}
