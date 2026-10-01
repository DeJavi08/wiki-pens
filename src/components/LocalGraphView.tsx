import React, { useEffect, useRef, useCallback } from 'react';
import { NoteItem } from '../types';
import { buildGraphData } from '../utils/markdownParser';

interface LocalGraphViewProps {
  currentNote: NoteItem;
  allNotes: NoteItem[];
  onSelectNote: (slug: string) => void;
  onOpenGlobalGraph: () => void;
}

interface GraphNode2D {
  id: string;
  title: string;
  category: string;
  isCurrent: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  degree: number;
}

export const LocalGraphView: React.FC<LocalGraphViewProps> = ({
  currentNote,
  allNotes,
  onSelectNote,
  onOpenGlobalGraph,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hover state (ref-based for instantaneous, non-physics re-render)
  const hoveredNodeIdRef = useRef<string | null>(null);
  const cursorStyleRef = useRef<string>('default');

  // Transform (Pan & Zoom)
  const transformRef = useRef<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 1.0 });

  // Dragging & Interaction
  const isDraggingCanvasRef = useRef<boolean>(false);
  const isDraggingNodeRef = useRef<GraphNode2D | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });
  const clickMovedRef = useRef<boolean>(false);

  // Simulation references
  const animFrameIdRef = useRef<number | null>(null);
  const isSimulatingRef = useRef<boolean>(false);
  const alphaRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode2D[]>([]);
  const edgesRef = useRef<Array<{ source: string; target: string }>>([]);

  // PURE DRAWING FUNCTION: Does NOT modify positions!
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width <= 0 || height <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const transform = transformRef.current;
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const hoveredId = hoveredNodeIdRef.current;

    // Harmonious 1-tone Obsidian palette (clean monochrome slate with purple active core)
    const baseNodeColor = isDark ? '#71717a' : '#94a3b8'; // zinc/slate
    const activeNodeColor = isDark ? '#8b5cf6' : '#7c3aed'; // Obsidian Purple
    const hoveredNodeColor = isDark ? '#c084fc' : '#9333ea';

    ctx.clearRect(0, 0, width, height);

    // Flat Obsidian Background
    ctx.fillStyle = isDark ? '#141419' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + transform.x, height / 2 + transform.y);
    ctx.scale(transform.k, transform.k);

    // Identify hovered neighbors
    const connectedToHover = new Set<string>();
    if (hoveredId) {
      connectedToHover.add(hoveredId);
      for (const e of edges) {
        if (e.source === hoveredId) connectedToHover.add(e.target);
        if (e.target === hoveredId) connectedToHover.add(e.source);
      }
    }

    // 1. DRAW EDGES
    for (const e of edges) {
      const s = nodes.find(n => n.id === e.source);
      const t = nodes.find(n => n.id === e.target);
      if (!s || !t) continue;

      const isHoverActive = hoveredId !== null;
      const isIncident = hoveredId
        ? (e.source === hoveredId || e.target === hoveredId)
        : (s.isCurrent || t.isCurrent);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (isIncident) {
        ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.85)' : 'rgba(124, 58, 237, 0.8)';
        ctx.lineWidth = 1.6 / transform.k;
      } else {
        const opacity = isHoverActive ? 0.04 : (isDark ? 0.15 : 0.12);
        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(15, 23, 42, ${opacity})`;
        ctx.lineWidth = 1.0 / transform.k;
      }

      ctx.stroke();
    }

    // 2. DRAW NODES (Cohesive, single-tone palette)
    for (const n of nodes) {
      const isHovered = hoveredId === n.id;
      const isDragged = isDraggingNodeRef.current?.id === n.id;
      const isConnected = connectedToHover.has(n.id);
      const isFaded = hoveredId !== null && !isConnected;

      const r = n.radius;
      let nodeFill = baseNodeColor;
      if (n.isCurrent) {
        nodeFill = activeNodeColor;
      } else if (isHovered) {
        nodeFill = hoveredNodeColor;
      }

      // Outer Halo for active, hovered, or dragged node
      if (n.isCurrent || isHovered || isDragged) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(124, 58, 237, 0.2)';
        ctx.fill();
      }

      // Main Circular Node Dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      if (isFaded) {
        ctx.fillStyle = isDark ? 'rgba(113, 113, 122, 0.25)' : 'rgba(203, 213, 225, 0.35)';
      } else {
        ctx.fillStyle = nodeFill;
      }
      ctx.fill();

      // Clean border
      ctx.strokeStyle = isDark ? 'rgba(20, 20, 25, 0.9)' : '#ffffff';
      ctx.lineWidth = 1.2 / transform.k;
      ctx.stroke();

      // Node Labels
      const showLabel = n.isCurrent || isHovered || isDragged || isConnected || transform.k > 1.2;
      if (showLabel && !isFaded) {
        const text = n.title.length > 20 ? n.title.slice(0, 18) + '..' : n.title;
        const fontSize = Math.max(9, Math.round(11 / transform.k));
        ctx.font = `${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

        const textX = n.x;
        const textY = n.y + r + fontSize + 2;

        // Label backdrop
        ctx.fillStyle = isDark ? 'rgba(20, 20, 25, 0.85)' : 'rgba(255, 255, 255, 0.9)';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(textX - textWidth / 2 - 2, textY - fontSize + 1, textWidth + 4, fontSize + 2);

        ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(text, textX, textY);
      }
    }

    ctx.restore();
  }, []);

  // PHYSICS TICK: Updates node velocities and positions
  const physicsTick = useCallback((width: number, height: number, transform: { x: number; y: number; k: number }) => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const alpha = alphaRef.current;

    // A. Center Anchor for Main Node & subtle pull for neighbors
    for (const n of nodes) {
      if (n === isDraggingNodeRef.current) continue;

      if (n.isCurrent) {
        // Strong elastic return spring pulling main node back to (0, 0)
        const dist = Math.hypot(n.x, n.y);
        if (dist > 0.05) {
          n.vx += (0 - n.x) * 0.16;
          n.vy += (0 - n.y) * 0.16;
          n.vx *= 0.80;
          n.vy *= 0.80;
        } else {
          n.x = 0;
          n.y = 0;
          n.vx = 0;
          n.vy = 0;
        }
      } else {
        // Neighbors gravitate toward cluster center
        n.vx -= n.x * 0.0035 * alpha;
        n.vy -= n.y * 0.0035 * alpha;
      }
    }

    // B. Charge Repulsion
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distSq = dx * dx + dy * dy + 30;
        const dist = Math.sqrt(distSq);
        const repForce = (650 / distSq) * alpha;

        if (n1 !== isDraggingNodeRef.current) {
          n1.vx += (dx / dist) * repForce;
          n1.vy += (dy / dist) * repForce;
        }
        if (n2 !== isDraggingNodeRef.current) {
          n2.vx -= (dx / dist) * repForce;
          n2.vy -= (dy / dist) * repForce;
        }
      }
    }

    // C. Elastic Springs
    for (const edge of edges) {
      const s = nodes.find(n => n.id === edge.source);
      const t = nodes.find(n => n.id === edge.target);
      if (s && t) {
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.hypot(dx, dy) || 1;
        const targetDist = 48;
        const displacement = dist - targetDist;
        const springStrength = 0.065;
        const force = displacement * springStrength * Math.max(0.35, alpha);

        if (s !== isDraggingNodeRef.current) {
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }
        if (t !== isDraggingNodeRef.current) {
          t.vx -= (dx / dist) * force;
          t.vy -= (dy / dist) * force;
        }
      }
    }

    // D. Velocity integration
    let maxVel = 0;
    for (const n of nodes) {
      if (n === isDraggingNodeRef.current) continue;

      n.vx *= 0.86;
      n.vy *= 0.86;
      n.x += n.vx;
      n.y += n.vy;

      const vel = Math.hypot(n.vx, n.vy);
      if (vel > maxVel) maxVel = vel;
    }

    // E. Soft radial boundary containment
    const maxRadius = Math.max(90, Math.min(width, height) * 0.44 / transform.k);
    for (const n of nodes) {
      if (n === isDraggingNodeRef.current) continue;
      const d = Math.hypot(n.x, n.y);
      if (d > maxRadius) {
        const push = (d - maxRadius) * 0.08;
        n.vx -= (n.x / d) * push;
        n.vy -= (n.y / d) * push;
      }
    }

    // Decay alpha (unless dragging a node)
    if (isDraggingNodeRef.current) {
      alphaRef.current = Math.max(alphaRef.current, 0.65);
    } else {
      alphaRef.current *= 0.96;
    }

    return maxVel;
  }, []);

  // ANIMATION LOOP (Only runs when alpha > 0.002 or dragging)
  const runLoop = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      isSimulatingRef.current = false;
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width <= 0 || height <= 0) {
      isSimulatingRef.current = false;
      return;
    }

    const shouldSimulate = alphaRef.current > 0.002 || isDraggingNodeRef.current !== null;

    if (shouldSimulate) {
      const maxVel = physicsTick(width, height, transformRef.current);

      if (alphaRef.current <= 0.002 && maxVel < 0.02 && !isDraggingNodeRef.current && !isDraggingCanvasRef.current) {
        alphaRef.current = 0;
      }
    }

    // Always draw current state
    drawCanvas();

    if (alphaRef.current > 0.002 || isDraggingNodeRef.current !== null || isDraggingCanvasRef.current) {
      animFrameIdRef.current = requestAnimationFrame(runLoop);
    } else {
      isSimulatingRef.current = false;
    }
  }, [physicsTick, drawCanvas]);

  // Wake simulation helper (ONLY called on initial note load or explicit drag)
  const wakeSimulation = useCallback((boost = 0.6) => {
    alphaRef.current = Math.max(alphaRef.current, boost);
    if (!isSimulatingRef.current) {
      isSimulatingRef.current = true;
      runLoop();
    }
  }, [runLoop]);

  // INITIALIZE ON NOTE CHANGE: Animates ONCE on open, then settles and STOPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 240;
    const height = canvas.clientHeight || 220;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const { nodes: rawNodes, edges: rawEdges } = buildGraphData(allNotes, currentNote.slug, false);

    const total = rawNodes.length;
    const nodes2D: GraphNode2D[] = rawNodes.map((n, i) => {
      let x = 0;
      let y = 0;
      if (!n.isCurrent) {
        const angle = (i / Math.max(1, total - 1)) * 2 * Math.PI;
        const dist = 50 + (i % 3) * 16;
        x = Math.cos(angle) * dist;
        y = Math.sin(angle) * dist;
      }

      const deg = rawEdges.filter(e => e.source === n.id || e.target === n.id).length;

      return {
        ...n,
        degree: deg,
        radius: n.isCurrent ? 6.5 : Math.min(6.5, Math.max(3.5, 3.5 + deg * 0.7)),
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      };
    });

    nodesRef.current = nodes2D;
    edgesRef.current = rawEdges;
    hoveredNodeIdRef.current = null;

    // Reset transform to center
    transformRef.current = { x: 0, y: 0, k: 1.0 };

    // Initial settle bounce (runs once on note open, then goes into 0% CPU sleep)
    alphaRef.current = 1.0;
    isSimulatingRef.current = true;
    runLoop();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      isSimulatingRef.current = false;
    };
  }, [allNotes, currentNote.slug, runLoop]);

  // Coordinate conversion
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.clientWidth : 240;
    const height = canvas ? canvas.clientHeight : 220;
    const transform = transformRef.current;

    const wx = (sx - (width / 2 + transform.x)) / transform.k;
    const wy = (sy - (height / 2 + transform.y)) / transform.k;
    return { x: wx, y: wy };
  }, []);

  const findNodeAtScreen = useCallback((sx: number, sy: number): GraphNode2D | null => {
    const { x: wx, y: wy } = screenToWorld(sx, sy);
    const nodes = nodesRef.current;
    const k = transformRef.current.k;

    for (const n of nodes) {
      const hitRadius = Math.max(22 / k, n.radius + 10 / k);
      const dist = Math.hypot(n.x - wx, n.y - wy);
      if (dist <= hitRadius) return n;
    }
    return null;
  }, [screenToWorld]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    clickMovedRef.current = false;
    const hitNode = findNodeAtScreen(sx, sy);

    if (hitNode) {
      isDraggingNodeRef.current = hitNode;
      hitNode.vx = 0;
      hitNode.vy = 0;
      dragStartRef.current = {
        x: sx,
        y: sy,
        panX: hitNode.x,
        panY: hitNode.y,
      };
      cursorStyleRef.current = 'grabbing';
      if (canvas) canvas.style.cursor = 'grabbing';
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = {
        x: sx,
        y: sy,
        panX: transformRef.current.x,
        panY: transformRef.current.y,
      };
      cursorStyleRef.current = 'move';
      if (canvas) canvas.style.cursor = 'move';
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    wakeSimulation(0.8);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // A. MOUSE HOVER OVER NODE:
    // NO PHYSICS! NO BOUNCING! Purely redraws highlighted lines & labels!
    if (!isDraggingCanvasRef.current && !isDraggingNodeRef.current) {
      const hit = findNodeAtScreen(sx, sy);
      const hitId = hit ? hit.id : null;
      if (hitId !== hoveredNodeIdRef.current) {
        hoveredNodeIdRef.current = hitId;
        canvas.style.cursor = hit ? 'grab' : 'default';
        // Redraw stationary without moving ANY node!
        drawCanvas();
      }
      return;
    }

    // B. DRAGGING NODE OR CANVAS
    const dx = sx - dragStartRef.current.x;
    const dy = sy - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > 3) {
      clickMovedRef.current = true;
    }

    if (isDraggingNodeRef.current) {
      const node = isDraggingNodeRef.current;
      const { x: wx, y: wy } = screenToWorld(sx, sy);

      node.vx = (wx - node.x) * 0.4;
      node.vy = (wy - node.y) * 0.4;
      node.x = wx;
      node.y = wy;

      alphaRef.current = Math.max(alphaRef.current, 0.7);
      wakeSimulation(0.7);
    } else if (isDraggingCanvasRef.current) {
      transformRef.current.x = dragStartRef.current.panX + dx;
      transformRef.current.y = dragStartRef.current.panY + dy;
      drawCanvas();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (!clickMovedRef.current && isDraggingNodeRef.current) {
      const clicked = isDraggingNodeRef.current;
      if (clicked.id !== currentNote.slug) {
        onSelectNote(clicked.id);
      }
    }

    const wasDraggingMainNode = isDraggingNodeRef.current?.isCurrent;
    isDraggingCanvasRef.current = false;
    isDraggingNodeRef.current = null;
    if (canvas) canvas.style.cursor = hoveredNodeIdRef.current ? 'grab' : 'default';

    // If main node was dragged, smoothly snap back to center
    if (wasDraggingMainNode) {
      wakeSimulation(0.9);
    } else {
      wakeSimulation(0.35);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newK = Math.max(0.4, Math.min(3.5, transformRef.current.k * zoomFactor));

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const wx = (mouseX - (width / 2 + transformRef.current.x)) / transformRef.current.k;
    const wy = (mouseY - (height / 2 + transformRef.current.y)) / transformRef.current.k;

    transformRef.current.k = newK;
    transformRef.current.x = mouseX - width / 2 - wx * newK;
    transformRef.current.y = mouseY - height / 2 - wy * newK;

    drawCanvas();
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, k: 1.0 };
    wakeSimulation(0.5);
  };

  return (
    <div
      ref={containerRef}
      className="local-graph-container rounded-3 border p-2 mb-3 shadow-xs position-relative"
      style={{
        backgroundColor: 'var(--wiki-card-bg)',
        borderColor: 'var(--wiki-border)',
        overflow: 'hidden',
      }}
    >
      {/* Header with Title and Quick Controls */}
      <div className="d-flex align-items-center justify-content-between mb-1.5 px-1">
        <span className="small fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
          <i className="bi bi-diagram-3-fill text-primary"></i>
          <span>Graph View</span>
        </span>

        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="btn btn-xs btn-outline-secondary py-0.5 px-1.5 rounded"
            style={{ fontSize: '0.66rem' }}
            onClick={resetView}
            title="Reset Posisi & Zoom"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
          </button>

          <button
            type="button"
            className="btn btn-xs btn-outline-primary py-0.5 px-1.5 rounded"
            style={{ fontSize: '0.66rem' }}
            onClick={onOpenGlobalGraph}
            title="Buka Graf Global (Obsidian Vault)"
          >
            <i className="bi bi-arrows-fullscreen me-1"></i>
            Global
          </button>
        </div>
      </div>

      {/* 2D Obsidian Canvas */}
      <div
        className="position-relative rounded-2 overflow-hidden"
        style={{ height: '220px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-100 h-100 d-block"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        />

        {/* Bottom Micro Badge */}
        <div
          className="position-absolute bottom-0 start-0 w-100 px-2 py-1 d-flex align-items-center justify-content-between text-muted"
          style={{
            fontSize: '0.64rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(3px)',
            pointerEvents: 'none',
          }}
        >
          <span>Tarik node untuk lenturkan jaring</span>
          <span>{nodesRef.current.length} nodes &bull; {edgesRef.current.length} links</span>
        </div>
      </div>
    </div>
  );
};
