import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NoteItem } from '../types';
import { buildGraphData } from '../utils/markdownParser';

interface GlobalGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  allNotes: NoteItem[];
  currentSlug: string;
  onSelectNote: (slug: string) => void;
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

export const GlobalGraphModal: React.FC<GlobalGraphModalProps> = ({
  isOpen,
  onClose,
  allNotes,
  currentSlug,
  onSelectNote,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hover state (ref-based for instantaneous, zero-physics re-render)
  const hoveredNodeIdRef = useRef<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Transform (Pan & Zoom)
  const transformRef = useRef<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 0.95 });

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

    // Harmonious 1-tone Obsidian palette (clean slate with purple active core)
    const baseNodeColor = isDark ? '#71717a' : '#94a3b8'; // zinc/slate
    const activeNodeColor = isDark ? '#8b5cf6' : '#7c3aed'; // Obsidian Purple
    const hoveredNodeColor = isDark ? '#c084fc' : '#9333ea';

    ctx.clearRect(0, 0, width, height);

    // Dark minimalist Obsidian background
    ctx.fillStyle = isDark ? '#141419' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + transform.x, height / 2 + transform.y);
    ctx.scale(transform.k, transform.k);

    // Filtering checks
    const searchNorm = searchFilter.trim().toLowerCase();
    const isNodeMatching = (n: GraphNode2D) => {
      const matchCat = selectedCategory === 'all' || n.category === selectedCategory;
      const matchSearch = !searchNorm || n.title.toLowerCase().includes(searchNorm);
      return matchCat && matchSearch;
    };

    // Connected neighbors of hovered node
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

      const sMatches = isNodeMatching(s);
      const tMatches = isNodeMatching(t);
      if (!sMatches && !tMatches) continue;

      const isHoverActive = hoveredId !== null;
      const isIncident = hoveredId
        ? (e.source === hoveredId || e.target === hoveredId)
        : (s.isCurrent || t.isCurrent);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (isIncident) {
        ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.88)' : 'rgba(124, 58, 237, 0.85)';
        ctx.lineWidth = 1.7 / transform.k;
      } else {
        const opacity = isHoverActive ? 0.04 : (isDark ? 0.15 : 0.12);
        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(15, 23, 42, ${opacity})`;
        ctx.lineWidth = 1.0 / transform.k;
      }

      ctx.stroke();
    }

    // 2. DRAW NODES (Cohesive, single-tone palette)
    for (const n of nodes) {
      const isMatch = isNodeMatching(n);
      const isHovered = hoveredId === n.id;
      const isDragged = isDraggingNodeRef.current?.id === n.id;
      const isConnected = connectedToHover.has(n.id);
      const isFaded = (!isMatch) || (hoveredId !== null && !isConnected);

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
        ctx.arc(n.x, n.y, r + 5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(168, 85, 247, 0.28)' : 'rgba(124, 58, 237, 0.22)';
        ctx.fill();
      }

      // Main Circular Node Dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      if (isFaded) {
        ctx.fillStyle = isDark ? 'rgba(113, 113, 122, 0.2)' : 'rgba(203, 213, 225, 0.3)';
      } else {
        ctx.fillStyle = nodeFill;
      }
      ctx.fill();

      // Border
      ctx.strokeStyle = isDark ? 'rgba(20, 20, 25, 0.9)' : '#ffffff';
      ctx.lineWidth = 1.2 / transform.k;
      ctx.stroke();

      // Node Labels
      const shouldShowLabel =
        showLabels &&
        !isFaded &&
        (n.isCurrent || isHovered || isDragged || isConnected || transform.k > 1.35 || n.degree >= 5);

      if (shouldShowLabel) {
        const text = n.title.length > 22 ? n.title.slice(0, 20) + '..' : n.title;
        const fontSize = Math.max(9.5, Math.round(11 / transform.k));
        ctx.font = `${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

        const textX = n.x;
        const textY = n.y + r + fontSize + 2;

        ctx.fillStyle = isDark ? 'rgba(20, 20, 25, 0.85)' : 'rgba(255, 255, 255, 0.9)';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(textX - textWidth / 2 - 2, textY - fontSize + 1, textWidth + 4, fontSize + 2);

        ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(text, textX, textY);
      }
    }

    ctx.restore();
  }, [selectedCategory, searchFilter, showLabels]);

  // PHYSICS TICK: Updates node velocities and positions
  const physicsTick = useCallback((width: number, height: number, transform: { x: number; y: number; k: number }) => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const alpha = alphaRef.current;

    // A. Center gravity & Strong Elastic Return Anchor for Current Main Note
    for (const n of nodes) {
      if (n === isDraggingNodeRef.current) continue;

      if (n.isCurrent) {
        const distToCenter = Math.hypot(n.x, n.y);
        if (distToCenter > 0.05) {
          n.vx += (0 - n.x) * 0.14;
          n.vy += (0 - n.y) * 0.14;
          n.vx *= 0.82;
          n.vy *= 0.82;
        } else {
          n.x = 0;
          n.y = 0;
          n.vx = 0;
          n.vy = 0;
        }
      } else {
        n.vx -= n.x * 0.002 * alpha;
        n.vy -= n.y * 0.002 * alpha;
      }
    }

    // B. Charge repulsion
    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distSq = dx * dx + dy * dy + 35;
        const dist = Math.sqrt(distSq);
        const repForce = (800 / distSq) * alpha;

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

    // C. Elastic Hooke's Law Springs along edges
    for (const edge of edges) {
      const s = nodes.find(n => n.id === edge.source);
      const t = nodes.find(n => n.id === edge.target);
      if (s && t) {
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.hypot(dx, dy) || 1;
        const targetDist = 62;
        const displacement = dist - targetDist;
        const springStrength = 0.055;
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

    // D. Velocity integration & damping
    let maxVel = 0;
    for (const n of nodes) {
      if (n === isDraggingNodeRef.current) continue;

      n.vx *= 0.88;
      n.vy *= 0.88;
      n.x += n.vx;
      n.y += n.vy;

      const vel = Math.hypot(n.vx, n.vy);
      if (vel > maxVel) maxVel = vel;
    }

    // E. Soft radial boundary containment
    const maxRadius = Math.max(160, Math.min(width, height) * 0.46 / transform.k);
    for (const n of nodes) {
      if (n === isDraggingNodeRef.current) continue;
      const d = Math.hypot(n.x, n.y);
      if (d > maxRadius) {
        const push = (d - maxRadius) * 0.06;
        n.vx -= (n.x / d) * push;
        n.vy -= (n.y / d) * push;
      }
    }

    // Decay alpha
    if (isDraggingNodeRef.current) {
      alphaRef.current = Math.max(alphaRef.current, 0.7);
    } else {
      alphaRef.current *= 0.965;
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

    const shouldSimulate = (alphaRef.current > 0.002 || isDraggingNodeRef.current !== null) && !isPaused;

    if (shouldSimulate) {
      const maxVel = physicsTick(width, height, transformRef.current);

      if (alphaRef.current <= 0.002 && maxVel < 0.02 && !isDraggingNodeRef.current && !isDraggingCanvasRef.current) {
        alphaRef.current = 0;
      }
    }

    // Draw current positions
    drawCanvas();

    if ((alphaRef.current > 0.002 || isDraggingNodeRef.current !== null || isDraggingCanvasRef.current) && !isPaused) {
      animFrameIdRef.current = requestAnimationFrame(runLoop);
    } else {
      isSimulatingRef.current = false;
    }
  }, [physicsTick, drawCanvas, isPaused]);

  // Wake simulation helper
  const wakeSimulation = useCallback((boost = 0.6) => {
    if (isPaused) return;
    alphaRef.current = Math.max(alphaRef.current, boost);
    if (!isSimulatingRef.current) {
      isSimulatingRef.current = true;
      runLoop();
    }
  }, [isPaused, runLoop]);

  // Re-render when filter/category/labels change
  useEffect(() => {
    drawCanvas();
  }, [selectedCategory, searchFilter, showLabels, drawCanvas]);

  // INITIALIZE ON MODAL OPEN: Animates ONCE on open, then settles and STOPS
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container?.clientWidth || 900;
    const height = Math.max(520, window.innerHeight - 220);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const { nodes: rawNodes, edges: rawEdges } = buildGraphData(allNotes, currentSlug, true);

    const total = rawNodes.length;
    const nodes2D: GraphNode2D[] = rawNodes.map((n, i) => {
      let x = 0;
      let y = 0;
      if (!n.isCurrent) {
        const angle = (i / total) * 2 * Math.PI;
        const dist = 130 + Math.random() * 80;
        x = Math.cos(angle) * dist;
        y = Math.sin(angle) * dist;
      }

      const deg = rawEdges.filter(e => e.source === n.id || e.target === n.id).length;

      return {
        ...n,
        degree: deg,
        radius: n.isCurrent ? 7.5 : Math.min(8.5, Math.max(4.0, 4.0 + deg * 0.65)),
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      };
    });

    nodesRef.current = nodes2D;
    edgesRef.current = rawEdges;
    hoveredNodeIdRef.current = null;

    transformRef.current = { x: 0, y: 0, k: 0.95 };

    // Initial settle bounce (runs once on open, then settles to 0% CPU sleep)
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
  }, [isOpen, allNotes, currentSlug, runLoop]);

  // Coordinate conversion
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.clientWidth : 900;
    const height = canvas ? canvas.clientHeight : 520;
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
      if (canvas) canvas.style.cursor = 'grabbing';
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = {
        x: sx,
        y: sy,
        panX: transformRef.current.x,
        panY: transformRef.current.y,
      };
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
      onSelectNote(clicked.id);
      onClose();
    }

    const wasDraggingMainNode = isDraggingNodeRef.current?.isCurrent;
    isDraggingCanvasRef.current = false;
    isDraggingNodeRef.current = null;
    if (canvas) canvas.style.cursor = hoveredNodeIdRef.current ? 'grab' : 'default';

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
    const newK = Math.max(0.35, Math.min(4.0, transformRef.current.k * zoomFactor));

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
    transformRef.current = { x: 0, y: 0, k: 0.95 };
    wakeSimulation(0.5);
  };

  const zoomIn = () => {
    transformRef.current.k = Math.min(4.0, transformRef.current.k * 1.25);
    drawCanvas();
  };

  const zoomOut = () => {
    transformRef.current.k = Math.max(0.35, transformRef.current.k * 0.8);
    drawCanvas();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '94vw' }}>
        <div
          className="modal-content shadow-lg border"
          style={{
            backgroundColor: 'var(--wiki-card-bg)',
            borderColor: 'var(--wiki-border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="modal-header py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between"
            style={{
              backgroundColor: 'var(--wiki-sidebar-bg)',
              borderColor: 'var(--wiki-border)',
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-diagram-3-fill fs-5 text-primary"></i>
              <div>
                <h6 className="modal-title fw-bold mb-0" style={{ fontSize: '0.98rem' }}>
                  Graph View (Obsidian Vault)
                </h6>
                <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                  {allNotes.length} notes &bull; {edgesRef.current.length} links &bull; Tarik node mana saja untuk meregangkan jaring
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1.5">
              <button
                type="button"
                className={`btn btn-sm ${showLabels ? 'btn-primary' : 'btn-outline-secondary'} py-1 px-2`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setShowLabels(prev => !prev)}
                title="Tampilkan / Sembunyikan Label"
              >
                <i className="bi bi-fonts me-1"></i>
                Label
              </button>

              <button
                type="button"
                className={`btn btn-sm ${isPaused ? 'btn-warning' : 'btn-outline-secondary'} py-1 px-2`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setIsPaused(prev => !prev)}
                title={isPaused ? 'Lanjutkan Simulasi' : 'Jeda Simulasi'}
              >
                <i className={`bi ${isPaused ? 'bi-play-fill' : 'bi-pause-fill'} me-1`}></i>
                {isPaused ? 'Lanjut' : 'Jeda'}
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-1 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={resetView}
                title="Reset Posisi & Zoom"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Tutup"
              ></button>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            className="px-3 py-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2"
            style={{
              backgroundColor: 'var(--wiki-badge-bg)',
              borderColor: 'var(--wiki-border)',
            }}
          >
            <div className="d-flex flex-wrap align-items-center gap-1.5">
              <span className="small text-muted me-1" style={{ fontSize: '0.75rem' }}>Groups:</span>
              {['all', 'Identitas', 'Akademik', 'Riset & Inovasi', 'Robotika', 'Kemahasiswaan', 'Komunitas'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-xs py-0.5 px-2 rounded ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => {
                    setSelectedCategory(cat);
                  }}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            <div className="d-flex align-items-center gap-2" style={{ maxWidth: '280px' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-end-0">
                  <i className="bi bi-search text-muted small"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Filter notes..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ fontSize: '0.78rem' }}
                />
              </div>
            </div>
          </div>

          {/* Modal Body with 2D Obsidian Canvas */}
          <div
            className="modal-body p-0 position-relative"
            style={{ height: '70vh' }}
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

            {/* Obsidian Zoom Control Buttons in Bottom-Right */}
            <div
              className="position-absolute bottom-0 end-0 m-3 btn-group-vertical shadow-sm"
              style={{ zIndex: 5 }}
            >
              <button
                type="button"
                className="btn btn-sm btn-dark bg-opacity-75 border-secondary"
                onClick={zoomIn}
                title="Zoom In"
              >
                <i className="bi bi-plus-lg"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-dark bg-opacity-75 border-secondary"
                onClick={zoomOut}
                title="Zoom Out"
              >
                <i className="bi bi-dash-lg"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-dark bg-opacity-75 border-secondary"
                onClick={resetView}
                title="Fit to Screen"
              >
                <i className="bi bi-fullscreen"></i>
              </button>
            </div>

            {/* Bottom HUD Hint */}
            <div
              className="position-absolute bottom-0 start-0 m-3 px-3 py-1.5 rounded-3 d-flex align-items-center gap-3 text-muted shadow-sm"
              style={{
                fontSize: '0.74rem',
                backgroundColor: 'rgba(20, 20, 25, 0.85)',
                color: '#f8fafc',
                backdropFilter: 'blur(6px)',
                pointerEvents: 'none',
              }}
            >
              <span>
                <i className="bi bi-hand-index-thumb me-1.5 text-success"></i>
                Tarik node untuk meregangkan jaring laba-laba
              </span>
              <span>&bull;</span>
              <span>
                <i className="bi bi-arrows-move me-1.5 text-primary"></i>
                Drag canvas kosong untuk pan
              </span>
              <span>&bull;</span>
              <span>
                <i className="bi bi-zoom-in me-1.5 text-info"></i>
                Scroll untuk zoom
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
