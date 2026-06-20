import * as d3 from 'd3';
import type { GraphNode, GraphLink } from '../../types/family';
import { NodeRenderer } from './NodeRenderer';
import { LinkRenderer } from './LinkRenderer';

export interface GraphControllerOptions {
  width?: number;
  height?: number;
  nodeRadius?: number;
  linkWidth?: number;
  chargeStrength?: number;
  linkDistance?: number;
  animationDuration?: number;
}

type GraphEventHandler = (event: { nodeId: string; event?: MouseEvent }) => void;

export class GraphController {
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private g: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  private simulation: d3.Simulation<GraphNode, GraphLink> | null = null;
  private nodeRenderer: NodeRenderer | null = null;
  private linkRenderer: LinkRenderer | null = null;

  private options: Required<GraphControllerOptions>;
  private nodes: GraphNode[] = [];
  private links: GraphLink[] = [];

  private nodeIdsSet: Set<string> = new Set();
  private linkIdsSet: Set<string> = new Set();
  private isFirstRender: boolean = true;
  private interactionsBound: boolean = false;

  private eventHandlers: Map<string, GraphEventHandler[]> = new Map();
  private tooltip: d3.Selection<HTMLDivElement, any, any, any> | null = null;
  private isDragging: boolean = false;

  constructor(container: HTMLElement, options: GraphControllerOptions = {}) {
    this.container = container;
    this.options = {
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
      nodeRadius: 28,
      linkWidth: 2,
      chargeStrength: -400,
      linkDistance: 120,
      animationDuration: 300,
      ...options,
    };
    this.init();
  }

  private init(): void {
    this.createSvg();
    this.createTooltip();
    this.createZoomBehavior();
    this.createRenderers();
    this.createSimulation();
    this.setupResizeListener();
  }

  private createSvg(): void {
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.options.width} ${this.options.height}`)
      .style('background', '#1a1a2e')
      .style('cursor', 'grab');

    this.g = this.svg.append('g').attr('class', 'graph-container');

    this.g.append('rect')
      .attr('width', this.options.width * 3)
      .attr('height', this.options.height * 3)
      .attr('x', -this.options.width)
      .attr('y', -this.options.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', () => this.emit('backgroundClick', { nodeId: '' }));
  }

  private createTooltip(): void {
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'graph-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('background', 'rgba(26, 26, 46, 0.95)')
      .style('color', '#ffffff')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
      .style('border', '1px solid rgba(230, 179, 37, 0.3)');
  }

  private createZoomBehavior(): void {
    this.zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        if (this.g) {
          this.g.attr('transform', event.transform);
        }
      });

    this.svg?.call(this.zoomBehavior);
  }

  private createRenderers(): void {
    if (!this.g) return;

    this.nodeRenderer = new NodeRenderer(this.g, {
      nodeRadius: this.options.nodeRadius,
      animationDuration: this.options.animationDuration,
    });

    this.linkRenderer = new LinkRenderer(this.g, {
      linkWidth: this.options.linkWidth,
      animationDuration: this.options.animationDuration,
    });
  }

  private createSimulation(): void {
    const { width, height, chargeStrength, linkDistance } = this.options;

    this.simulation = d3
      .forceSimulation<GraphNode, GraphLink>([])
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>()
          .id((d) => d.id)
          .distance(linkDistance)
          .strength(0.6)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(this.options.nodeRadius * 2))
      .alphaDecay(0.02)
      .velocityDecay(0.4)
      .on('tick', () => this.tick());

    this.simulation.stop();
  }

  private setupResizeListener(): void {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.options.width = width;
        this.options.height = height;

        this.svg?.attr('viewBox', `0 0 ${width} ${height}`);

        if (this.simulation && this.nodes.length > 0) {
          this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
          this.simulation.alpha(0.1).restart();
        }
      }
    });

    resizeObserver.observe(this.container);
  }

  private hasStructureChanged(newNodes: GraphNode[], newLinks: GraphLink[]): boolean {
    if (this.isFirstRender) return true;

    const newNodeIds = new Set(newNodes.map(n => n.id));
    const newLinkIds = new Set(newLinks.map(l => l.id));

    if (newNodeIds.size !== this.nodeIdsSet.size) return true;
    if (newLinkIds.size !== this.linkIdsSet.size) return true;

    for (const id of newNodeIds) {
      if (!this.nodeIdsSet.has(id)) return true;
    }
    for (const id of newLinkIds) {
      if (!this.linkIdsSet.has(id)) return true;
    }

    return false;
  }

  private mergeNodePositions(oldNodes: GraphNode[], newNodes: GraphNode[]): GraphNode[] {
    const posMap = new Map<string, { x: number; y: number; fx: number | null; fy: number | null }>();
    oldNodes.forEach(n => {
      posMap.set(n.id, { x: n.x ?? 0, y: n.y ?? 0, fx: n.fx ?? null, fy: n.fy ?? null });
    });

    return newNodes.map(n => {
      const pos = posMap.get(n.id);
      if (pos) {
        return {
          ...n,
          x: n.x ?? pos.x,
          y: n.y ?? pos.y,
          fx: pos.fx,
          fy: pos.fy,
        };
      }
      return n;
    });
  }

  render(nodes: GraphNode[], links: GraphLink[]): void {
    const structureChanged = this.hasStructureChanged(nodes, links);

    if (structureChanged) {
      const mergedNodes = this.isFirstRender
        ? nodes
        : this.mergeNodePositions(this.nodes, nodes);

      this.nodes = mergedNodes;
      this.links = links;

      this.nodeIdsSet = new Set(nodes.map(n => n.id));
      this.linkIdsSet = new Set(links.map(l => l.id));

      this.linkRenderer?.render(links, mergedNodes);
      this.nodeRenderer?.render(mergedNodes);

      if (!this.interactionsBound) {
        this.setupNodeInteractions();
        this.setupLinkInteractions();
        this.interactionsBound = true;
      }

      if (this.isFirstRender) {
        this.restartSimulation(0.8);
        this.isFirstRender = false;
      } else {
        this.restartSimulation(0.3);
      }
    } else {
      this.linkRenderer?.render(links, this.nodes);
      this.nodeRenderer?.updateHighlight(nodes);
    }
  }

  private setupNodeInteractions(): void {
    const nodeSelection = this.nodeRenderer?.getSelection();
    if (!nodeSelection) return;

    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        this.isDragging = true;
        if (!event.active && this.simulation) {
          this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
        this.hideTooltip();
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        this.isDragging = false;
        if (!event.active && this.simulation) {
          this.simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });

    nodeSelection
      .call(drag)
      .on('click', (event, d) => {
        if (this.isDragging) return;
        event.stopPropagation();
        this.emit('click', { nodeId: d.id, event });
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        this.emit('dblclick', { nodeId: d.id, event });
      })
      .on('mouseenter', (event, d) => {
        if (this.isDragging) return;
        this.showTooltip(event, d);
        this.emit('mouseenter', { nodeId: d.id, event });
      })
      .on('mousemove', (event, d) => {
        this.moveTooltip(event);
      })
      .on('mouseleave', (event, d) => {
        this.hideTooltip();
        this.emit('mouseleave', { nodeId: d.id, event });
      });
  }

  private setupLinkInteractions(): void {
    const linkSelection = this.linkRenderer?.getSelection();
    if (!linkSelection) return;

    linkSelection
      .on('mouseenter', (event, d) => {
        this.emit('linkMouseEnter', { nodeId: d.id, event });
      })
      .on('mouseleave', (event, d) => {
        this.emit('linkMouseLeave', { nodeId: d.id, event });
      });
  }

  private showTooltip(event: MouseEvent, d: GraphNode): void {
    if (!this.tooltip) return;

    const member = d.member;
    const isDeceased = !!member.deathDate;

    const content = `
      <div style="font-weight: 600; margin-bottom: 4px; color: #e6b325;">
        ${member.name} ${isDeceased ? '⚱️' : ''}
      </div>
      <div style="color: #aaa; font-size: 11px; margin-bottom: 4px;">
        ${member.gender === 'male' ? '男' : '女'} · ${member.branch} · 第${member.generation}代
      </div>
      ${member.birthDate ? `<div style="color: #888; font-size: 11px;">${member.birthDate}${member.deathDate ? ' - ' + member.deathDate : ''}</div>` : ''}
      ${member.note ? `<div style="color: #888; font-size: 11px; margin-top: 4px;">${member.note}</div>` : ''}
    `;

    this.tooltip
      .html(content)
      .style('opacity', 1)
      .style('left', event.pageX + 15 + 'px')
      .style('top', event.pageY - 10 + 'px');
  }

  private moveTooltip(event: MouseEvent): void {
    this.tooltip
      ?.style('left', event.pageX + 15 + 'px')
      .style('top', event.pageY - 10 + 'px');
  }

  private hideTooltip(): void {
    this.tooltip?.style('opacity', 0);
  }

  private tick(): void {
    this.nodeRenderer?.updatePositions(this.nodes);
    this.linkRenderer?.updatePositions(this.links, this.nodes);
  }

  private restartSimulation(alpha: number = 0.3): void {
    if (!this.simulation) return;

    this.simulation.nodes(this.nodes);

    const linkForce = this.simulation.force<d3.ForceLink<GraphNode, GraphLink>>('link');
    if (linkForce) {
      linkForce.links(this.links);
    }

    this.simulation.alpha(alpha).restart();
  }

  updateHighlight(nodes: GraphNode[], links: GraphLink[]): void {
    this.nodeRenderer?.updateHighlightDirect(nodes);
    this.linkRenderer?.updateHighlightDirect(links, this.nodes);
  }

  zoom(factor: number): void {
    if (!this.svg || !this.zoomBehavior) return;

    this.svg.transition().duration(300).call(
      this.zoomBehavior.scaleBy,
      factor
    );
  }

  zoomTo(factor: number): void {
    if (!this.svg || !this.zoomBehavior) return;

    this.svg.transition().duration(300).call(
      this.zoomBehavior.scaleTo,
      factor
    );
  }

  resetView(): void {
    if (!this.svg || !this.zoomBehavior) return;

    this.svg.transition().duration(500).call(
      this.zoomBehavior.transform,
      d3.zoomIdentity
    );
  }

  centerOnNode(nodeId: string): void {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node || !this.svg || !this.zoomBehavior) return;

    const x = node.x ?? this.options.width / 2;
    const y = node.y ?? this.options.height / 2;

    const scale = 1.5;
    const transform = d3.zoomIdentity
      .translate(this.options.width / 2 - x * scale, this.options.height / 2 - y * scale)
      .scale(scale);

    this.svg.transition().duration(500).call(this.zoomBehavior.transform, transform);
  }

  on(event: 'click' | 'dblclick' | 'mouseenter' | 'mouseleave' | 'backgroundClick' | 'linkMouseEnter' | 'linkMouseLeave', handler: GraphEventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, handler: GraphEventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  private emit(event: string, data: { nodeId: string; event?: MouseEvent }): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach((handler) => handler(data));
  }

  startHighlightAnimation(): void {
    this.nodeRenderer?.startHighlightPulse();
  }

  stopHighlightAnimation(): void {
    this.nodeRenderer?.stopHighlightPulse();
  }

  destroy(): void {
    this.simulation?.stop();
    this.zoomBehavior?.on('zoom', null);
    this.nodeRenderer?.destroy();
    this.linkRenderer?.destroy();
    this.tooltip?.remove();
    this.svg?.remove();
    this.eventHandlers.clear();
  }
}
