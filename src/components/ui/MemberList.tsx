import { Search, User } from 'lucide-react';
import { useFamilyStore } from '../../store/useFamilyStore';

export function MemberList() {
  const { members, setSelectedMember, selectedMemberId, setHighlightedMember, engine, filters } = useFamilyStore();

  const filteredMembers = engine.filterMembers(filters);

  const groupedByGeneration = filteredMembers.reduce((acc, member) => {
    const gen = member.generation;
    if (!acc[gen]) acc[gen] = [];
    acc[gen].push(member);
    return acc;
  }, {} as Record<number, typeof filteredMembers>);

  const sortedGenerations = Object.keys(groupedByGeneration)
    .map(Number)
    .sort((a, b) => a - b);

  if (filteredMembers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
        <User className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">暂无成员</p>
        <p className="text-xs mt-1">点击右上角添加成员开始</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {sortedGenerations.map((gen) => (
        <div key={gen} className="mb-2">
          <div className="px-3 py-1.5 bg-[#1a1a2e] sticky top-0 z-10">
            <span className="text-[#e6b325] text-sm font-medium">第{gen}代</span>
            <span className="text-gray-500 text-xs ml-2">({groupedByGeneration[gen].length}人)</span>
          </div>
          <div className="space-y-0.5">
            {groupedByGeneration[gen].map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedMember(member.id);
                  setHighlightedMember(member.id);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                  selectedMemberId === member.id
                    ? 'bg-[#e6b325]/20 border-l-2 border-[#e6b325]'
                    : 'hover:bg-[#2a2a4e] border-l-2 border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    member.deathDate
                      ? 'bg-gray-600 border border-gray-500 border-dashed'
                      : member.gender === 'male'
                        ? 'bg-blue-500/30 text-blue-300'
                        : 'bg-pink-500/30 text-pink-300'
                  }`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">
                    {member.name}
                    {member.deathDate && <span className="text-gray-500 ml-1">⚱️</span>}
                  </p>
                  <p className="text-gray-500 text-xs truncate">{member.branch}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
