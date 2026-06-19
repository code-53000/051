import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFamilyStore } from './store/useFamilyStore';

export default function App() {
  const { loadData, isLoading, error } = useFamilyStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e6b325]/30 border-t-[#e6b325] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl text-white mb-2">加载失败</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#e6b325] hover:bg-[#f0c040] text-[#1a1a2e] font-medium rounded-lg transition-colors"
          >
            刷新重试
          </button>
        </div>
      </div>
    );
  }

  return <AppLayout />;
}
