import { useState, useEffect } from 'react';
import { X, Save, UserPlus } from 'lucide-react';
import { useFamilyStore } from '../../store/useFamilyStore';
import type { Gender } from '../../types/family';
import type { CreateMemberInput } from '../../data/repositories/MemberRepository';

interface MemberFormProps {
  onClose: () => void;
}

export function MemberForm({ onClose }: MemberFormProps) {
  const { editingMember, addMember, updateMember, engine } = useFamilyStore();
  const isEditing = !!editingMember;

  const [formData, setFormData] = useState<CreateMemberInput>({
    name: '',
    gender: 'male',
    branch: '',
    generation: 1,
    birthDate: '',
    deathDate: '',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name,
        gender: editingMember.gender,
        branch: editingMember.branch,
        generation: editingMember.generation,
        birthDate: editingMember.birthDate || '',
        deathDate: editingMember.deathDate || '',
        note: editingMember.note || '',
      });
    }
  }, [editingMember]);

  const branches = engine.getBranches();
  const { min, max } = engine.getGenerationRange();
  const generations = Array.from({ length: max - min + 3 }, (_, i) => min - 1 + i).filter((g) => g > 0);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.branch.trim()) {
      newErrors.branch = '请输入所属分支';
    }
    if (formData.generation < 1) {
      newErrors.generation = '代数必须大于0';
    }
    if (formData.birthDate && formData.deathDate && formData.birthDate > formData.deathDate) {
      newErrors.deathDate = '去世日期不能早于出生日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && editingMember) {
        await updateMember({
          id: editingMember.id,
          ...formData,
        });
      } else {
        await addMember(formData);
      }
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : '保存失败' });
    }
  };

  const handleChange = (field: keyof CreateMemberInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a4e] rounded-xl shadow-2xl w-full max-w-md border border-[#e6b325]/30">
        <div className="flex items-center justify-between p-4 border-b border-[#e6b325]/20">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <UserPlus className="w-5 h-5 text-[#e6b325]" />
            ) : (
              <UserPlus className="w-5 h-5 text-[#e6b325]" />
            )}
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? '编辑成员' : '添加成员'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              姓名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 bg-[#1a1a2e] border ${errors.name ? 'border-red-500' : 'border-[#e6b325]/30'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e6b325] transition-colors`}
              placeholder="请输入姓名"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              性别 <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => handleChange('gender', e.target.value as Gender)}
                  className="w-4 h-4 accent-[#e6b325]"
                />
                <span className="text-gray-300">男</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => handleChange('gender', e.target.value as Gender)}
                  className="w-4 h-4 accent-[#e6b325]"
                />
                <span className="text-gray-300">女</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              所属分支（房） <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
              list="branches"
              className={`w-full px-3 py-2 bg-[#1a1a2e] border ${errors.branch ? 'border-red-500' : 'border-[#e6b325]/30'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e6b325] transition-colors`}
              placeholder="如：长房、二房"
            />
            <datalist id="branches">
              {branches.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
            {errors.branch && <p className="text-red-400 text-xs mt-1">{errors.branch}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              代数 <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.generation}
              onChange={(e) => handleChange('generation', parseInt(e.target.value))}
              className={`w-full px-3 py-2 bg-[#1a1a2e] border ${errors.generation ? 'border-red-500' : 'border-[#e6b325]/30'} rounded-lg text-white focus:outline-none focus:border-[#e6b325] transition-colors`}
            >
              {generations.map((g) => (
                <option key={g} value={g}>
                  第{g}代
                </option>
              ))}
            </select>
            {errors.generation && <p className="text-red-400 text-xs mt-1">{errors.generation}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                出生日期
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#e6b325]/30 rounded-lg text-white focus:outline-none focus:border-[#e6b325] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                去世日期
              </label>
              <input
                type="date"
                value={formData.deathDate}
                onChange={(e) => handleChange('deathDate', e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#e6b325]/30 rounded-lg text-white focus:outline-none focus:border-[#e6b325] transition-colors"
              />
              {errors.deathDate && <p className="text-red-400 text-xs mt-1">{errors.deathDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              备注
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#e6b325]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e6b325] transition-colors resize-none"
              placeholder="生平简介、相关故事等"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#e6b325] hover:bg-[#f0c040] text-[#1a1a2e] font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
