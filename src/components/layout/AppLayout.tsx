import { useState } from 'react';
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

  const {
    showMemberForm,
    closeMemberForm,
    selectedMemberId,
    setSelectedMember,
    setHighlightedMember,
    toggleExpand,
    getGraphData,
  } = useFamilyStore();

  const { nodes, links } = getGraphData();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1a1a2e] overflow-hidden">
      <Header
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onOpenDataIO={() => setShowDataIO(true)}
      />

      <FilterBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

        <main className="flex-1 relative">
          <ForceGraph
            nodes={nodes}
            links={links}
            onNodeClick={(nodeId) => {
              setSelectedMember(nodeId);
              setHighlightedMember(nodeId);
            }}
            onNodeDoubleClick={(nodeId) => {
              toggleExpand(nodeId);
            }}
            onNodeHover={(nodeId) => {
              setHighlightedMember(nodeId);
            }}
            onBackgroundClick={() => {
              setSelectedMember(null);
              setHighlightedMember(null);
            }}
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
      {showDataIO && <DataIO onClose={() => setShowDataIO(false)} />}
    </div>
  );
}
