import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GameState } from '../types';

interface D3WordGraphProps {
  gameState: GameState;
}


export function D3WordGraph({ gameState }: D3WordGraphProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const lastTransform = useRef<d3.ZoomTransform | null>(null);

  // Função para formatar nodes
  function getNodes() {
    return gameState.visibleNodes.map((id) => {
      const node = gameState.nodes[id];
      let display = node?.word ?? id;
      let original = node?.word ?? id;
      if (node && !node.revealed) {
        const letters = Array.from(node.word);
        const letterCount = letters.filter((c) => /\p{L}/u.test(c)).length;
        if (letters.length > 2) {
          display = letters.map((c, i) => {
            if (i === 0 || i === letters.length - 1) return c;
            if (node.hintedLetterIndexes && node.hintedLetterIndexes.includes(i)) return c;
            return /\p{L}/u.test(c) ? '*' : c;
          }).join('') + ` (${letterCount})`;
        } else {
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
  }

  function getLinks(nodes: any[]) {
    const nodeMap = Object.fromEntries(nodes.map((n: any) => [n.id, n]));
    const links: { source: string; target: string }[] = [];
    nodes.forEach((node: any) => {
      (gameState.nodes[node.id]?.connections || []).forEach((connId: string) => {
        if (nodeMap[connId]) {
          if (!links.find((l) => (l.source === connId && l.target === node.id) || (l.source === node.id && l.target === connId))) {
            links.push({ source: node.id, target: connId });
          }
        }
      });
    });
    return links;
  }

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    // Cria grupos para links, nós e labels, garantindo ordem correta
    if (!gRef.current) {
      const g = svg.append('g');
      gRef.current = g.node();
    }
    const d3g = d3.select(gRef.current!);
    const linkGroup = d3g.select('g[data-group="links"]');
    const nodeGroup = d3g.select('g[data-group="nodes"]');
    const labelGroup = d3g.select('g[data-group="labels"]');

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        d3g.attr('transform', event.transform);
        lastTransform.current = event.transform;
      });
    svg.call(zoomBehavior);
    if (lastTransform.current) {
      d3g.attr('transform', lastTransform.current.toString());
      svg.call(zoomBehavior.transform, lastTransform.current);
    }

    // Inicializa simulação apenas uma vez
    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation()
        .force('link', d3.forceLink().id((d: any) => d.id).distance(90))
        .force('charge', d3.forceManyBody().strength(-320))
        .force('center', d3.forceCenter(600 / 2, 600 / 2));
    }
    const simulation = simulationRef.current;

    // Atualiza nodes e links
    const nodes = getNodes();
    const links = getLinks(nodes);
    simulation.nodes(nodes as any);
    (simulation.force('link') as d3.ForceLink<any, any>).links(links);

    // JOIN links (sempre atrás)
    const linkSel = linkGroup.selectAll<SVGLineElement, any>('line')
      .data(links, (d: any) => `${d.source}-${d.target}`);
    linkSel.join(
      enter => enter.append('line').attr('stroke', '#bbb').attr('stroke-width', 1.8),
      update => update,
      exit => exit.remove()
    );

    // JOIN nodes (círculos)
    const nodeSel = nodeGroup.selectAll<SVGCircleElement, any>('circle')
      .data(nodes, (d: any) => d.id);
    nodeSel.join(
      enter => enter.append('circle')
        .attr('r', 18)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('fill', (d) => d.revealed ? 'rgba(59, 130, 246, 0.7)' : '#dbeafe')
        .call(d3.drag<Element, any>()
          .on('start', function (event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', function (event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', function (event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any),
      update => update
        .attr('fill', (d) => d.revealed ? 'rgb(59, 180, 246, 0.9)' : '#dbeafe'),
      exit => exit.remove()
    );

    // JOIN labels (palavras) - destaque visual
    const labelSel = labelGroup.selectAll<SVGTextElement, any>('text')
      .data(nodes, (d: any) => d.id);
    labelSel.join(
      enter => enter.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', 16)
        .attr('font-weight', 500)
        .attr('font-family', 'Montserrat, Arial, sans-serif')
        .attr('fill', '#1e293b') // slate-800
        .attr('stroke', 'none')
        .attr('stroke-width', 0)
        .attr('paint-order', null)
        .attr('pointer-events', 'none')
        .style('filter', 'drop-shadow(0 1px 2px #0003)')
        .style('opacity', 1)
        .text((d) => d.word),
      update => update
        .attr('font-size', 16)
        .attr('font-weight', 500)
        .attr('font-family', 'Montserrat, Arial, sans-serif')
        .attr('fill', '#1e293b')
        .attr('stroke', 'none')
        .attr('stroke-width', 0)
        .attr('paint-order', null)
        .style('filter', 'drop-shadow(0 1px 2px #0003)')
        .style('opacity', 1)
        .text((d) => d.word),
      exit => exit.remove()
    );

    simulation.on('tick', () => {
      linkGroup.selectAll<SVGLineElement, any>('line')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      nodeGroup.selectAll<SVGCircleElement, any>('circle')
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
      labelGroup.selectAll<SVGTextElement, any>('text')
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    simulation.alpha(1).restart();

    return () => {
      // Não remove o SVG, só para a simulação
      simulation.stop();
    };
  }, [gameState]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 600,
        minWidth: 600,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e2e8f0', // slate-200 (off-white mais escuro)
      }}
    >
      <svg ref={ref} width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
}
