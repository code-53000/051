import { useState, useRef } from 'react';
import { Download, Upload, Database, Trash2, FileJson } from 'lucide-react';
import { useFamilyStore } from '../../store/useFamilyStore';

interface DataIOProps {
  onClose: () => void;
}

export function DataIO({ onClose }: DataIOProps) {
  const { exportData, importData, clearData, loadSampleData, members } = useFamilyStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mergeMode, setMergeMode] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importData(file, mergeMode);
      if (result.success) {
        showMessage('success', `导入成功：${result.membersAdded} 个成员，${result.relationshipsAdded} 条关系`);
        onClose();
      } else {
        showMessage('error', result.errors?.[0] || '导入失败');
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : '导入失败');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSample = async () => {
    if (members.length > 0 && !confirm('加载示例数据将覆盖现有数据，确定继续吗？')) {
      return;
    }

    try {
      const result = await loadSampleData();
      if (result.success) {
        showMessage('success', `示例数据加载成功：${result.membersAdded} 个成员`);
        onClose();
      } else {
        showMessage('error', result.errors?.[0] || '加载失败');
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : '加载失败');
    }
  };

  const handleClear = async () => {
    try {
      await clearData();
      showMessage('success', '数据已清空');
      setShowClearConfirm(false);
      onClose();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : '清空失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a4e] rounded-xl shadow-2xl w-full max-w-md border border-[#e6b325]/30">
        <div className="flex items-center justify-between p-4 border-b border-[#e6b325]/20">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#e6b325]" />
            <h2 className="text-lg font-semibold text-white">数据管理</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          {message && (
            <div
              className={`px-3 py-2 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                  : 'bg-red-500/20 border border-red-500/50 text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#e6b325]/20">
            <div className="flex items-center gap-2 mb-3">
              <FileJson className="w-4 h-4 text-[#e6b325]" />
              <span className="text-white font-medium">示例数据</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              加载李氏家族示例族谱（5代38人），快速体验功能。
            </p>
            <button
              onClick={handleLoadSample}
              className="w-full px-4 py-2 bg-[#e6b325] hover:bg-[#f0c040] text-[#1a1a2e] font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              加载示例数据
            </button>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#e6b325]/20">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-[#e6b325]" />
              <span className="text-white font-medium">导出数据</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              将所有成员和关系数据导出为 JSON 文件备份。
            </p>
            <button
              onClick={() => {
                exportData();
                showMessage('success', '数据导出成功');
                onClose();
              }}
              className="w-full px-4 py-2 bg-[#3a3a6e] hover:bg-[#4a4a8e] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出 JSON
            </button>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#e6b325]/20">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-[#e6b325]" />
              <span className="text-white font-medium">导入数据</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              从 JSON 文件导入族谱数据。
            </p>
            <label className="flex items-center gap-2 mb-3 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={mergeMode}
                onChange={(e) => setMergeMode(e.target.checked)}
                className="w-4 h-4 accent-[#e6b325]"
              />
              合并模式（保留现有数据）
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 bg-[#3a3a6e] hover:bg-[#4a4a8e] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              选择文件导入
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-red-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-white font-medium">清空数据</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              删除所有成员和关系数据，此操作不可撤销。
            </p>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                清空所有数据
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-red-400 text-sm text-center">确定要删除所有数据吗？</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-gray-500 text-xs text-center pt-2">
            💡 所有数据仅保存在本地浏览器中，不会上传到任何服务器
          </div>
        </div>
      </div>
    </div>
  );
}
