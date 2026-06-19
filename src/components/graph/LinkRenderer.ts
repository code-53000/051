import * as d3 from 'd3';
import type { GraphLink, GraphNode } from '../../types/family';
import { LINK_COLORS } from '../../types/family';

export interface LinkRendererOptions {
  linkWidth?: number;
  highlightedLinkWidth?: number;
  animationDuration?: number;
}

export class LinkRenderer {
  private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  private options: Required<LinkRendererOptions>;
  private linkGroup: d3.Selection<SVGGElement, any, any, any> | null = null;
  private defs: d3.Selection<SVGDefsElement, unknown, null, undefined> | null = null;

  constructor(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    options: LinkRendererOptions = {}
  ) {
    this.svg = svg;
    this.options = {
      linkWidth: 2,
      highlightedLinkWidth: 4,
      animationDuration: 300,
      ...options,
    };
    this.createDefs();
  }

  private createDefs(): void {
    this.defs = this.svg.append('defs');

    const markerWidth = 8;
    const markerHeight = 8;
    const refX = 28 + markerWidth / 2;

    Object.entries(LINK_COLORS).forEach(([type, color]) => {
      this.defs!
        .append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', refX)
        .attr('refY', 0)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color)
        .attr('opacity', 0.8);
    });

    const gradient = this.defs
      .append('linearGradient')
      .attr('id', 'link-gradient-parent')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#e6b325').attr('stop-opacity', 0.3);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#e6b325').attr('stop-opacity', 0.8);
  }

  render(links: GraphLink[], nodes: GraphNode[]): void {
    const { linkWidth, highlightedLinkWidth, animationDuration } = this.options;

    if (!this.linkGroup) {
      this.linkGroup = this.svg.insert('g', ':first-child').attr('class', 'links');
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const linkSelection = this.linkGroup
      .selectAll<SVGGElement, GraphLink>('g.link')
      .data(links, (d) => d.id);

    const linkEnter = linkSelection
      .enter()
      .append('g')
      .attr('class', 'link')
      .style('opacity', 0);

    linkEnter
      .append('line')
      .attr('class', 'link-bg')
      .attr('stroke', (d) => this.getLinkColor(d))
      .attr('stroke-width', (d) => (d.isHighlighted ? highlightedLinkWidth : linkWidth))
      .attr('stroke-opacity', (d) => (d.isDimmed ? 0.1 : 0.6))
      .attr('stroke-linecap', 'round');

    linkEnter
      .append('line')
      .attr('class', 'link-hover')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 20)
      .style('cursor', 'pointer');

    linkEnter
      .append('path')
      .attr('class', 'link-label-bg')
      .attr('fill', 'rgba(26, 26, 46, 0.9)')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('opacity', 0);

    linkEnter
      .append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', 10)
      .attr('dy', '0.35em')
      .style('opacity', 0)
      .text((d) => this.getLinkLabel(d));

    linkEnter.transition().duration(animationDuration).style('opacity', 1);

    const mergedSelection = linkSelection.merge(linkEnter);

    mergedSelection
      .select<SVGLineElement>('line.link-bg')
      .transition()
      .duration(animationDuration)
      .attr('stroke', (d) => this.getLinkColor(d))
      .attr('stroke-width', (d) => (d.isHighlighted ? highlightedLinkWidth : linkWidth))
      .attr('stroke-opacity', (d) => (d.isDimmed ? 0.1 : d.isHighlighted ? 1 : 0.6));

    mergedSelection
      .select<SVGTextElement>('text.link-label')
      .transition()
      .duration(animationDuration)
      .style('opacity', (d) => (d.isHighlighted ? 1 : 0));

    mergedSelection
      .select<SVGPathElement>('path.link-label-bg')
      .transition()
      .duration(animationDuration)
      .style('opacity', (d) => (d.isHighlighted ? 0.9 : 0));

    linkSelection.exit().transition().duration(animationDuration).style('opacity', 0).remove();

    this.updatePositions(links, nodes);
  }

  getSelection(): d3.Selection<SVGGElement, GraphLink, SVGGElement, unknown> | null {
    return this.linkGroup?.selectAll<SVGGElement, GraphLink>('g.link') || null;
  }

  updatePositions(links: GraphLink[], nodes: GraphNode[]): void {
    if (!this.linkGroup) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    this.linkGroup
      .selectAll<SVGGElement, GraphLink>('g.link')
      .data(links, (d) => d.id)
      .each(function (d) {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;

        const source = nodeMap.get(sourceId);
        const target = nodeMap.get(targetId);

        if (!source || !target) return;

        const sx = source.x ?? 0;
        const sy = source.y ?? 0;
        const tx = target.x ?? 0;
        const ty = target.y ?? 0;

        const g = d3.select(this);

        g.select<SVGLineElement>('line.link-bg')
          .attr('x1', sx)
          .attr('y1', sy)
          .attr('x2', tx)
          .attr('y2', ty);

        g.select<SVGLineElement>('line.link-hover')
          .attr('x1', sx)
          .attr('y1', sy)
          .attr('x2', tx)
          .attr('y2', ty);

        if (d.isHighlighted) {
          const midX = (sx + tx) / 2;
          const midY = (sy + ty) / 2;
          const label = g.select<SVGTextElement>('text.link-label').text();
          const labelWidth = label.length * 12;

          g.select<SVGTextElement>('text.link-label')
            .attr('x', midX)
            .attr('y', midY - 8);

          g.select<SVGPathElement>('path.link-label-bg')
            .attr(
              'd',
              `M${midX - labelWidth / 2 - 6},${midY - 16}
               h${labelWidth + 12}
               v16
               h${-labelWidth - 12}
               z`
            );
        }
      });
  }

  private getLinkColor(d: GraphLink): string {
    if (d.isHighlighted) {
      return LINK_COLORS[d.type];
    }
    return d.isDimmed ? '#444444' : LINK_COLORS[d.type];
  }

  private getLinkLabel(d: GraphLink): string {
    const labels: Record<string, string> = {
      parent: '父母子女',
      spouse: '配偶',
      sibling: '兄弟姐妹',
    };
    return labels[d.type] || '';
  }

  destroy(): void {
    this.defs?.remove();
    this.linkGroup?.remove();
    this.defs = null;
    this.linkGroup = null;
  }
}
