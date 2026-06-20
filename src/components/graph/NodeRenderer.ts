import * as d3 from 'd3';
import type { GraphNode } from '../../types/family';
import { BRANCH_COLORS, GENDER_COLORS } from '../../types/family';

export interface NodeRendererOptions {
  nodeRadius?: number;
  fontSize?: number;
  animationDuration?: number;
}

export class NodeRenderer {
  private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  private options: Required<NodeRendererOptions>;
  private nodeGroup: d3.Selection<SVGGElement, any, any, any> | null = null;

  constructor(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    options: NodeRendererOptions = {}
  ) {
    this.svg = svg;
    this.options = {
      nodeRadius: 28,
      fontSize: 12,
      animationDuration: 300,
      ...options,
    };
  }

  render(nodes: GraphNode[]): void {
    const { nodeRadius, fontSize, animationDuration } = this.options;

    if (!this.nodeGroup) {
      this.nodeGroup = this.svg.append('g').attr('class', 'nodes');
    }

    const nodeSelection = this.nodeGroup
      .selectAll<SVGGElement, GraphNode>('g.node')
      .data(nodes, (d) => d.id);

    const nodeEnter = nodeSelection
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`)
      .style('opacity', 0)
      .style('cursor', 'pointer');

    nodeEnter
      .append('circle')
      .attr('class', 'node-bg')
      .attr('r', nodeRadius)
      .attr('fill', (d) => this.getNodeColor(d))
      .attr('stroke', (d) => this.getNodeStroke(d))
      .attr('stroke-width', (d) => this.getNodeStrokeWidth(d))
      .attr('stroke-dasharray', (d) => (d.member.deathDate ? '4,2' : 'none'));

    nodeEnter
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', fontSize)
      .attr('font-weight', '500')
      .text((d) => this.truncateText(d.member.name, 6));

    nodeEnter
      .append('circle')
      .attr('class', 'node-halo')
      .attr('r', nodeRadius + 4)
      .attr('fill', 'none')
      .attr('stroke', '#e6b325')
      .attr('stroke-width', 0)
      .attr('opacity', 0);

    nodeEnter
      .append('circle')
      .attr('class', 'node-expand-indicator')
      .attr('r', 6)
      .attr('cx', nodeRadius - 2)
      .attr('cy', nodeRadius - 2)
      .attr('fill', (d) => (d.isExpanded ? '#4ade80' : '#6b7280'))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    nodeEnter.transition().duration(animationDuration).style('opacity', 1);

    nodeSelection
      .merge(nodeEnter)
      .select<SVGCircleElement>('circle.node-bg')
      .transition()
      .duration(animationDuration)
      .attr('r', (d) => (d.isHighlighted ? nodeRadius + 3 : nodeRadius))
      .attr('fill', (d) => this.getNodeColor(d))
      .attr('stroke', (d) => this.getNodeStroke(d))
      .attr('stroke-width', (d) => this.getNodeStrokeWidth(d));

    nodeSelection
      .merge(nodeEnter)
      .select<SVGCircleElement>('circle.node-halo')
      .transition()
      .duration(animationDuration)
      .attr('stroke-width', (d) => (d.isHighlighted ? 3 : 0))
      .attr('opacity', (d) => (d.isHighlighted ? 0.8 : 0));

    nodeSelection
      .merge(nodeEnter)
      .select<SVGCircleElement>('circle.node-expand-indicator')
      .transition()
      .duration(animationDuration)
      .attr('fill', (d) => (d.isExpanded ? '#4ade80' : '#6b7280'));

    nodeSelection
      .merge(nodeEnter)
      .select<SVGTextElement>('text.node-label')
      .transition()
      .duration(animationDuration)
      .style('opacity', (d) => (d.isDimmed ? 0.4 : 1));

    nodeSelection
      .merge(nodeEnter)
      .transition()
      .duration(animationDuration)
      .style('opacity', (d) => (d.isDimmed ? 0.3 : 1));

    nodeSelection.exit().transition().duration(animationDuration).style('opacity', 0).remove();
  }

  getSelection(): d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null {
    return this.nodeGroup?.selectAll<SVGGElement, GraphNode>('g.node') || null;
  }

  updatePositions(nodes: GraphNode[]): void {
    if (!this.nodeGroup) return;

    this.nodeGroup
      .selectAll<SVGGElement, GraphNode>('g.node')
      .data(nodes, (d) => d.id)
      .attr('transform', (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
  }

  startHighlightPulse(): void {
    if (!this.nodeGroup) return;

    this.nodeGroup
      .selectAll<SVGGElement, GraphNode>('g.node')
      .filter((d) => d.isHighlighted)
      .select<SVGCircleElement>('circle.node-halo')
      .transition()
      .duration(1000)
      .ease(d3.easeSinInOut)
      .attr('r', this.options.nodeRadius + 12)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .ease(d3.easeSinInOut)
      .attr('r', this.options.nodeRadius + 4)
      .attr('opacity', 0.8)
      .on('end', function () {
        d3.select(this)
          .transition()
          .duration(1000)
          .ease(d3.easeSinInOut)
          .attr('r', 40)
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .ease(d3.easeSinInOut)
          .attr('r', 32)
          .attr('opacity', 0.8)
          .on('end', () => {
            // 循环动画
          });
      });
  }

  stopHighlightPulse(): void {
    if (!this.nodeGroup) return;

    this.nodeGroup
      .selectAll<SVGCircleElement, GraphNode>('circle.node-halo')
      .interrupt();
  }

  private getNodeColor(d: GraphNode): string {
    if (d.isHighlighted) {
      return '#e6b325';
    }
    const branchColor = BRANCH_COLORS[d.member.branch] || BRANCH_COLORS.default;
    return d.isDimmed ? this.darkenColor(branchColor, 0.5) : branchColor;
  }

  private getNodeStroke(d: GraphNode): string {
    if (d.isHighlighted) {
      return '#ffffff';
    }
    if (d.member.deathDate) {
      return '#888888';
    }
    return GENDER_COLORS[d.member.gender];
  }

  private getNodeStrokeWidth(d: GraphNode): number {
    if (d.isHighlighted) return 4;
    if (d.member.deathDate) return 1;
    return 2.5;
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.round(parseInt(hex.slice(0, 2), 16) * factor);
    const g = Math.round(parseInt(hex.slice(2, 4), 16) * factor);
    const b = Math.round(parseInt(hex.slice(4, 6), 16) * factor);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + '…';
  }

  updateHighlight(nodes: GraphNode[]): void {
    if (!this.nodeGroup) return;

    const { nodeRadius, animationDuration } = this.options;

    const nodeSelection = this.nodeGroup
      .selectAll<SVGGElement, GraphNode>('g.node')
      .data(nodes, (d) => d.id);

    nodeSelection
      .select<SVGCircleElement>('circle.node-bg')
      .transition()
      .duration(animationDuration)
      .attr('r', (d) => (d.isHighlighted ? nodeRadius + 3 : nodeRadius))
      .attr('fill', (d) => this.getNodeColor(d))
      .attr('stroke', (d) => this.getNodeStroke(d))
      .attr('stroke-width', (d) => this.getNodeStrokeWidth(d));

    nodeSelection
      .select<SVGCircleElement>('circle.node-halo')
      .transition()
      .duration(animationDuration)
      .attr('stroke-width', (d) => (d.isHighlighted ? 3 : 0))
      .attr('opacity', (d) => (d.isHighlighted ? 0.8 : 0));

    nodeSelection
      .select<SVGCircleElement>('circle.node-expand-indicator')
      .transition()
      .duration(animationDuration)
      .attr('fill', (d) => (d.isExpanded ? '#4ade80' : '#6b7280'));

    nodeSelection
      .select<SVGTextElement>('text.node-label')
      .transition()
      .duration(animationDuration)
      .style('opacity', (d) => (d.isDimmed ? 0.4 : 1));

    nodeSelection
      .transition()
      .duration(animationDuration)
      .style('opacity', (d) => (d.isDimmed ? 0.3 : 1));
  }

  destroy(): void {
    this.stopHighlightPulse();
    this.nodeGroup?.remove();
    this.nodeGroup = null;
  }
}
