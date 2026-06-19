import { useState } from 'react';
import { X, Edit2, Trash2, UserPlus, Link2, User, Calendar, Building2, Layers, FileText, Heart, Users } from 'lucide-react';
import { useFamilyStore } from '../../store/useFamilyStore';
import { KINSHIP_LABELS } from '../../types/family';

export function DetailPanel() {
  const {
    selectedMemberId,
    setSelectedMember,
    engine,
    openMemberForm,
    deleteMember,
    setHighlightedMember,
    members,
  } = useFamilyStore();

  const [showAddRelation, setShowAddRelation] = useState<'parent' | 'child' | 'spouse' | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState('');

  if (!selectedMemberId) return null;

  const memberWithRelatives = engine.getMemberWithRelatives(selectedMemberId);
  if (!memberWithRelatives) return null;

  const member = memberWithRelatives;
  const isDeceased = !!member.deathDate;

  const handleDelete = () => {
    if (confirm(`确定要删除 ${member.name} 吗？相关的关系也会被删除。`)) {
      deleteMember(member.id);
    }
  };

  const handleAddRelation = async (type: 'parent' | 'child' | 'spouse') => {
    if (!selectedRelationId) return;

    try {
      if (type === 'parent') {
        await useFamilyStore.getState().addParentChild(selectedRelationId, member.id);
      } else if (type === 'child') {
        await useFamilyStore.getState().addParentChild(member.id, selectedRelationId);
      } else if (type === 'spouse') {
        await useFamilyStore.getState().addSpouse(member.id, selectedRelationId);
      }
      setShowAddRelation(null);
      setSelectedRelationId('');
    } catch (error) {
      alert(error instanceof Error ? error.message : '添加关系失败');
    }
  };

  const handleRemoveRelation = async (type: 'parent' | 'child' | 'spouse', relatedId: string) => {
    const relatedMember = engine.getMemberById(relatedId);
    if (!relatedMember) return;

    if (confirm(`确定要解除 ${member.name} 和 ${relatedMember.name} 的关系吗？`)) {
      try {
        if (type === 'parent') {
          await useFamilyStore.getState().removeParentChild(relatedId, member.id);
        } else if (type === 'child') {
          await useFamilyStore.getState().removeParentChild(member.id, relatedId);
        } else if (type === 'spouse') {
          await useFamilyStore.getState().removeSpouse(member.id, relatedId);
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : '解除关系失败');
      }
    }
  };

  const availableMembers = members.filter((m) => {
    if (m.id === member.id) return false;
    if (memberWithRelatives.parents.some((p) => p.id === m.id)) return false;
    if (memberWithRelatives.children.some((c) => c.id === m.id)) return false;
    if (memberWithRelatives.spouse?.id === m.id) return false;
    if (memberWithRelatives.siblings.some((s) => s.id === m.id)) return false;
    return true;
  });

  const getKinship = (otherId: string) => {
    return engine.getKinshipLabel(member.id, otherId);
  };

  return (
    <div className="w-80 bg-[#2a2a4e] border-l border-[#e6b325]/20 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#e6b325]/20">
        <h3 className="text-lg font-semibold text-white">成员详情</h3>
        <button
          onClick={() => setSelectedMember(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold ${isDeceased ? 'bg-gray-600' : member.gender === 'male' ? 'bg-blue-500/30' : 'bg-pink-500/30'} border-4 ${isDeceased ? 'border-gray-500 border-dashed' : member.gender === 'male' ? 'border-blue-400' : 'border-pink-400'}`}
          >
            {member.name.charAt(0)}
          </div>
          <h4 className="mt-3 text-xl font-bold text-white">
            {member.name}
            {isDeceased && <span className="ml-2 text-gray-400 text-sm">⚱️</span>}
          </h4>
          <p className="text-[#e6b325] text-sm">{member.branch} · 第{member.generation}代</p>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 text-gray-300">
            <User className="w-4 h-4 text-[#e6b325]" />
            <span className="text-gray-400 w-16">性别：</span>
            <span>{member.gender === 'male' ? '男' : '女'}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-300">
            <Building2 className="w-4 h-4 text-[#e6b325]" />
            <span className="text-gray-400 w-16">分支：</span>
            <span>{member.branch}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-300">
            <Layers className="w-4 h-4 text-[#e6b325]" />
            <span className="text-gray-400 w-16">代数：</span>
            <span>第{member.generation}代</span>
          </div>

          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="w-4 h-4 text-[#e6b325]" />
            <span className="text-gray-400 w-16">生卒：</span>
            <span>
              {member.birthDate || '不详'}
              {member.deathDate ? ` - ${member.deathDate}` : member.birthDate ? ' 至今' : ''}
            </span>
          </div>

          {member.note && (
            <div className="flex gap-3 text-gray-300 pt-2 border-t border-[#e6b325]/10">
              <FileText className="w-4 h-4 text-[#e6b325] flex-shrink-0 mt-0.5" />
              <span className="text-gray-400 w-16 flex-shrink-0">备注：</span>
              <p className="text-sm leading-relaxed">{member.note}</p>
            </div>
          )}
        </div>

        {member.spouse && (
          <div className="bg-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#c94c4c]" />
                <span className="text-gray-300 font-medium">配偶</span>
              </div>
              <button
                onClick={() => handleRemoveRelation('spouse', member.spouse!.id)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                解除
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedMember(member.spouse!.id);
                setHighlightedMember(member.spouse!.id);
              }}
              className="flex items-center gap-2 w-full p-2 rounded hover:bg-[#2a2a4e] transition-colors text-left"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${member.spouse.gender === 'male' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'}`}
              >
                {member.spouse.name.charAt(0)}
              </div>
              <div>
                <p className="text-white text-sm">{member.spouse.name}</p>
                <p className="text-gray-500 text-xs">{member.spouse.branch}</p>
              </div>
            </button>
          </div>
        )}

        {member.parents.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#e6b325]" />
                <span className="text-gray-300 font-medium">父母</span>
              </div>
            </div>
            <div className="space-y-2">
              {member.parents.map((parent) => (
                <div key={parent.id} className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedMember(parent.id);
                      setHighlightedMember(parent.id);
                    }}
                    className="flex items-center gap-2 flex-1 p-2 rounded hover:bg-[#2a2a4e] transition-colors text-left"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${parent.gender === 'male' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'}`}
                    >
                      {parent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm">{parent.name}</p>
                      <p className="text-gray-500 text-xs">
                        {getKinship(parent.id)} · {parent.branch}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRemoveRelation('parent', parent.id)}
                    className="text-red-400 hover:text-red-300 text-xs px-2"
                  >
                    解除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {member.children.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6b8e8e]" />
                <span className="text-gray-300 font-medium">子女 ({member.children.length})</span>
              </div>
            </div>
            <div className="space-y-2">
              {member.children.map((child) => (
                <div key={child.id} className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedMember(child.id);
                      setHighlightedMember(child.id);
                    }}
                    className="flex items-center gap-2 flex-1 p-2 rounded hover:bg-[#2a2a4e] transition-colors text-left"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${child.gender === 'male' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'}`}
                    >
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm">{child.name}</p>
                      <p className="text-gray-500 text-xs">
                        {getKinship(child.id)} · {child.branch}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRemoveRelation('child', child.id)}
                    className="text-red-400 hover:text-red-300 text-xs px-2"
                  >
                    解除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {member.siblings.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#6b6b8e]" />
              <span className="text-gray-300 font-medium">兄弟姐妹 ({member.siblings.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.siblings.map((sibling) => (
                <button
                  key={sibling.id}
                  onClick={() => {
                    setSelectedMember(sibling.id);
                    setHighlightedMember(sibling.id);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-[#2a2a4e] transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${sibling.gender === 'male' ? 'bg-blue-500/30 text-blue-300' : 'bg-pink-500/30 text-pink-300'}`}
                  >
                    {sibling.name.charAt(0)}
                  </div>
                  <span className="text-white text-xs">{sibling.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#1a1a2e] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-[#e6b325]" />
            <span className="text-gray-300 font-medium">添加关系</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowAddRelation(showAddRelation === 'parent' ? null : 'parent')}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${showAddRelation === 'parent' ? 'bg-[#e6b325] text-[#1a1a2e]' : 'bg-[#2a2a4e] text-gray-300 hover:bg-[#3a3a6e]'}`}
            >
              父/母
            </button>
            <button
              onClick={() => setShowAddRelation(showAddRelation === 'child' ? null : 'child')}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${showAddRelation === 'child' ? 'bg-[#e6b325] text-[#1a1a2e]' : 'bg-[#2a2a4e] text-gray-300 hover:bg-[#3a3a6e]'}`}
            >
              子/女
            </button>
            <button
              onClick={() => setShowAddRelation(showAddRelation === 'spouse' ? null : 'spouse')}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${showAddRelation === 'spouse' ? 'bg-[#e6b325] text-[#1a1a2e]' : 'bg-[#2a2a4e] text-gray-300 hover:bg-[#3a3a6e]'}`}
            >
              配偶
            </button>
          </div>

          {showAddRelation && availableMembers.length > 0 && (
            <div className="mt-3 space-y-2">
              <select
                value={selectedRelationId}
                onChange={(e) => setSelectedRelationId(e.target.value)}
                className="w-full px-2 py-2 bg-[#2a2a4e] border border-[#e6b325]/30 rounded text-white text-sm focus:outline-none focus:border-[#e6b325]"
              >
                <option value="">选择成员...</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.branch} · 第{m.generation}代)
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAddRelation(showAddRelation)}
                disabled={!selectedRelationId}
                className="w-full px-3 py-2 bg-[#e6b325] hover:bg-[#f0c040] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#1a1a2e] font-medium rounded text-sm transition-colors"
              >
                确认添加
              </button>
            </div>
          )}

          {showAddRelation && availableMembers.length === 0 && (
            <p className="mt-3 text-gray-500 text-xs text-center">
              暂无可添加的成员，请先创建其他成员
            </p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-[#e6b325]/20 space-y-2">
        <button
          onClick={() => openMemberForm(member)}
          className="w-full px-4 py-2 bg-[#3a3a6e] hover:bg-[#4a4a8e] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          编辑成员
        </button>
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          删除成员
        </button>
      </div>
    </div>
  );
}
