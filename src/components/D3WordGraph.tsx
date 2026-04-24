import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GameState } from '../types';

interface D3WordGraphProps {
  gameState: GameState;
}


export function D3WordGraph({ gameState }: D3WordGraphProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  // Armazena o último transform do zoom
  const lastTransform = useRef<d3.ZoomTransform | null>(null);


  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    // Grupo para aplicar zoom/pan
    const g = svg.append('g');

    // Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        lastTransform.current = event.transform;
      });

    svg.call(zoomBehavior);

    // Se já existe um transform salvo, aplica ao grupo
    if (lastTransform.current) {
      g.attr('transform', lastTransform.current.toString());
      svg.call(zoomBehavior.transform, lastTransform.current);
    }

    // Prepare nodes and links for D3

    const nodes = gameState.visibleNodes.map((id) => {
      const node = gameState.nodes[id];
      let display = node?.word ?? id;
      let original = node?.word ?? id;
      if (node && !node.revealed) {
        const letters = Array.from(node.word);
        const letterCount = letters.filter((c) => /\p{L}/u.test(c)).length;
        if (letters.length > 2) {
          display = letters.map((c, i) => {
            if (i === 0 || i === letters.length - 1) return c;
            // Mostra letra se ela foi revelada por dica
            if (node.hintedLetterIndexes && node.hintedLetterIndexes.includes(i)) return c;
            return /\p{L}/u.test(c) ? '*' : c;
          }).join('') + ` (${letterCount})`;
        } else {
          // Para palavras curtas, mostra letras reveladas por dica
          display = letters.map((c, i) => {
            if (node.hintedLetterIndexes && node.hintedLetterIndexes.includes(i)) return c;
            return /\p{L}/u.test(c) ? '*' : c;
          }).join('') + ` (${letterCount})`;
        }
      } else if (node) {
        const letterCount = Array.from(node.word).filter((c) => /\p{L}/u.test(c)).length;
        display = node.word + ` (${letterCount})`;
      }
      return {
        id,
        word: display,
        revealed: node?.revealed ?? false,
        original,
      };
    });
    const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const links: { source: string; target: string }[] = [];
    nodes.forEach((node) => {
      (gameState.nodes[node.id]?.connections || []).forEach((connId) => {
        if (nodeMap[connId]) {
          // Avoid duplicate links
          if (!links.find((l) => (l.source === connId && l.target === node.id) || (l.source === node.id && l.target === connId))) {
            links.push({ source: node.id, target: connId });
          }
        }
      });
    });

    const width = 600;
    const height = 600;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(width / 2, height / 2));


    const link = g.append('g')
      .attr('stroke', '#bbb')
      .attr('stroke-width', 1.8)
      .selectAll('line')
      .data(links)
      .join('line');



    // Draw nodes (smaller)

    const node = g.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 18)
      .attr('fill', (d) => d.revealed ? 'rgba(59, 130, 246, 0.35)' : '#dbeafe')
      .call(d3.drag()
        .on('start', function (event, d: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', function (event, d: any) {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', function (event, d: any) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Draw masked/letter-count label inside node

    const maskedLabel = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', 11)
      .attr('pointer-events', 'none')
      .text((d) => d.word);

    // Do not draw any label below the node

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
      maskedLabel
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [gameState]);

  return (
    <div
      style={{
        width: 1024,
        height: 1024,
        // background: `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80') center/cover no-repeat, #0a1124`,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg ref={ref} width={1024} height={1024} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
}
