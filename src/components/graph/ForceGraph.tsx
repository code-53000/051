import { useEffect, useRef, useCallback } from 'react';
import type { GraphNode, GraphLink, FilterOptions, HighlightMode } from '../../types/family';
import { GraphController } from './GraphController';

interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onBackgroundClick?: () => void;
  className?: string;
}

export function ForceGraph({
  nodes,
  links,
  onNodeClick,
  onNodeDoubleClick,
  onNodeHover,
  onBackgroundClick,
  className,
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<GraphController | null>(null);

  const handleZoomIn = useCallback(() => {
    controllerRef.current?.zoom(1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    controllerRef.current?.zoom(0.8);
  }, []);

  const handleResetView = useCallback(() => {
    controllerRef.current?.resetView();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new GraphController(containerRef.current, {
      nodeRadius: 28,
      linkWidth: 2,
      chargeStrength: -400,
      linkDistance: 120,
      animationDuration: 300,
    });

    controllerRef.current = controller;

    if (onNodeClick) {
      controller.on('click', ({ nodeId }) => onNodeClick(nodeId));
    }

    if (onNodeDoubleClick) {
      controller.on('dblclick', ({ nodeId }) => onNodeDoubleClick(nodeId));
    }

    if (onNodeHover) {
      controller.on('mouseenter', ({ nodeId }) => onNodeHover(nodeId));
      controller.on('mouseleave', () => onNodeHover(null));
    }

    if (onBackgroundClick) {
      controller.on('backgroundClick', () => onBackgroundClick());
    }

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [onNodeClick, onNodeDoubleClick, onNodeHover, onBackgroundClick]);

  useEffect(() => {
    if (controllerRef.current && nodes.length > 0) {
      controllerRef.current.render(nodes, links);
    }
  }, [nodes, links]);

  useEffect(() => {
    (window as any).__graphController = controllerRef.current;
    (window as any).__zoomIn = handleZoomIn;
    (window as any).__zoomOut = handleZoomOut;
    (window as any).__resetView = handleResetView;
  }, [handleZoomIn, handleZoomOut, handleResetView]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={`w-full h-full ${className || ''}`}
      />

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-[#2a2a4e] hover:bg-[#3a3a6e] text-white rounded-lg shadow-lg flex items-center justify-center transition-all border border-[#e6b325]/30 hover:border-[#e6b325]"
          title="放大"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>

        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-[#2a2a4e] hover:bg-[#3a3a6e] text-white rounded-lg shadow-lg flex items-center justify-center transition-all border border-[#e6b325]/30 hover:border-[#e6b325]"
          title="缩小"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>

        <button
          onClick={handleResetView}
          className="w-10 h-10 bg-[#2a2a4e] hover:bg-[#3a3a6e] text-white rounded-lg shadow-lg flex items-center justify-center transition-all border border-[#e6b325]/30 hover:border-[#e6b325]"
          title="重置视图"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-[#2a2a4e]/90 rounded-lg px-4 py-2 text-xs text-gray-300 border border-[#e6b325]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e6b325' }} />
            <span>父母子女</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#c94c4c' }} />
            <span>配偶</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6b8e8e' }} />
            <span>兄弟姐妹</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FilterOptions, HighlightMode };
