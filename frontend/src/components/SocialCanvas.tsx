import React, { useEffect, useRef, useState, useMemo } from "react";
import { Node, Edge } from "../types";

interface SocialCanvasProps {
  users: string[];
  graph: Record<string, string[]>;
  activeNode: string | null;
  queueNodes: string[];
  visitedNodes: string[];
  highlightedPath: string[];
  communities: string[][];
  onSelectNode?: (username: string) => void;
  selectedStart?: string | null;
  selectedEnd?: string | null;
  theme?: "light" | "dark";
  language?: "en" | "hi";
  canvasMode: "select" | "add_person" | "create_friendship" | "eraser";
  onAddUserInline?: (username: string) => Promise<boolean>;
  onAddFriendshipInline?: (user1: string, user2: string) => Promise<boolean>;
  onDeleteUserInline?: (username: string) => Promise<boolean>;
  onDeleteFriendshipInline?: (user1: string, user2: string) => Promise<boolean>;
}

// Distance helper from click point to line segment (for erasing friendships)
function getDistanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t)); // clamp to segment
  
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

// Community color palette
const COMMUNITY_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

// Deterministic node styling palette for vibrant individual node coloring
const NODE_STYLE_PALETTE = [
  { fillLight: "#eff6ff", border: "#3b82f6", textLight: "#1e40af", fillDark: "#0c192c", textDark: "#60a5fa" }, // Blue
  { fillLight: "#ecfdf5", border: "#10b981", textLight: "#065f46", fillDark: "#062016", textDark: "#34d399" }, // Emerald
  { fillLight: "#fdf2f8", border: "#ec4899", textLight: "#9d174d", fillDark: "#2d0b1a", textDark: "#f472b6" }, // Pink
  { fillLight: "#faf5ff", border: "#8b5cf6", textLight: "#5b21b6", fillDark: "#1b0d2d", textDark: "#a78bfa" }, // Purple
  { fillLight: "#fff7ed", border: "#f97316", textLight: "#9a3412", fillDark: "#2b1008", textDark: "#fb923c" }, // Orange
  { fillLight: "#f0fdfa", border: "#0d9488", textLight: "#115e59", fillDark: "#041d1a", textDark: "#2dd4bf" }, // Teal
  { fillLight: "#fef2f2", border: "#ef4444", textLight: "#991b1b", fillDark: "#2c0b0b", textDark: "#f87171" }, // Red
  { fillLight: "#f0f9ff", border: "#0ea5e9", textLight: "#0369a1", fillDark: "#051e2e", textDark: "#38bdf8" }, // Sky
];

function getNodeBaseColors(username: string, theme: "light" | "dark") {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % NODE_STYLE_PALETTE.length;
  const colors = NODE_STYLE_PALETTE[index];
  return {
    fill: theme === "light" ? colors.fillLight : colors.fillDark,
    border: colors.border,
    label: theme === "light" ? colors.textLight : colors.textDark,
  };
}

export default function SocialCanvas({
  users,
  graph,
  activeNode,
  queueNodes,
  visitedNodes,
  highlightedPath,
  communities,
  onSelectNode,
  selectedStart,
  selectedEnd,
  theme = "dark",
  language = "en",
  canvasMode,
  onAddUserInline,
  onAddFriendshipInline,
  onDeleteUserInline,
  onDeleteFriendshipInline,
}: SocialCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Maintain local state of nodes with position and velocity
  const [nodes, setNodes] = useState<Node[]>([]);
  const dragNodeRef = useRef<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Advanced Interactive Modes States
  const [pendingAddPos, setPendingAddPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingUsername, setPendingUsername] = useState("");
  const [firstSelectedNode, setFirstSelectedNode] = useState<string | null>(null);
  const [hoveredMousePos, setHoveredMousePos] = useState<{ x: number; y: number } | null>(null);

  // Ref to track where we clicked, so physics sets the newly added node right at that position
  const lastClickCoordsRef = useRef<{ x: number; y: number } | null>(null);

  // Clear sub-states when canvasMode changes
  useEffect(() => {
    setPendingAddPos(null);
    setPendingUsername("");
    setFirstSelectedNode(null);
  }, [canvasMode]);

  // Prepare a mapping of communities for quick coloring O(1)
  const nodeCommunityMap = useMemo(() => {
    const map: Record<string, number> = {};
    communities.forEach((community, index) => {
      community.forEach((username) => {
        map[username] = index;
      });
    });
    return map;
  }, [communities]);

  // Edges derived from graph (avoid duplicate pairs for drawing)
  const edges = useMemo(() => {
    const list: Edge[] = [];
    const seen = new Set<string>();
    
    Object.entries(graph).forEach(([user, friends]) => {
      friends.forEach((friend) => {
        const key = [user, friend].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ source: user, target: friend });
        }
      });
    });
    return list;
  }, [graph]);

  // Sync users list to physics nodes
  useEffect(() => {
    setNodes((prevNodes) => {
      const prevMap = new Map(prevNodes.map((n) => [n.id, n]));
      
      return users.map((username, idx) => {
        const existing = prevMap.get(username);
        if (existing) return existing;

        // Position at click coordinates if we just added it inline
        if (lastClickCoordsRef.current) {
          const coords = lastClickCoordsRef.current;
          lastClickCoordsRef.current = null; // consume it
          return {
            id: username,
            label: username,
            x: coords.x,
            y: coords.y,
            vx: 0,
            vy: 0,
            radius: 24,
          };
        }

        // Position on a circle initially if new
        const angle = (idx / (users.length || 1)) * Math.PI * 2;
        const radius = 230;
        const centerX = 300;
        const centerY = 220;
        
        return {
          id: username,
          label: username,
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
          vx: 0,
          vy: 0,
          radius: 24,
        };
      });
    });
  }, [users]);

  // Handle Resize of canvas container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        canvas.width = entry.contentRect.width || 600;
        canvas.height = entry.contentRect.height || 450;
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Force-directed physics loop
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tick = () => {
      setNodes((currentNodes) => {
        if (currentNodes.length === 0) return currentNodes;

        const width = canvas.width || 600;
        const height = canvas.height || 450;
        const centerX = width / 2;
        const centerY = height / 2;

        // 1. Create a deep copy to mutate
        const updated = currentNodes.map((n) => ({ ...n }));

        const repulsionConstant = 18000;
        const attractionConstant = 0.02;
        const centerAttraction = 0.005;
        const friction = 0.85;
        const restLength = 250;

        // 2. Center gravity
        updated.forEach((n) => {
          if (n.id === dragNodeRef.current) return;
          n.vx += (centerX - n.x) * centerAttraction;
          n.vy += (centerY - n.y) * centerAttraction;
        });

        // 3. Coulomb Repulsion between all node pairs
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const n1 = updated[i];
            const n2 = updated[j];

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);

            if (dist < 500) {
              const force = repulsionConstant / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1.id !== dragNodeRef.current) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2.id !== dragNodeRef.current) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 4. Hooke's Spring Attraction along edges
        edges.forEach((edge) => {
          const n1 = updated.find((n) => n.id === edge.source);
          const n2 = updated.find((n) => n.id === edge.target);

          if (!n1 || !n2) return;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

          const displacement = dist - restLength;
          const force = attractionConstant * displacement;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (n1.id !== dragNodeRef.current) {
            n1.vx += fx;
            n1.vy += fy;
          }
          if (n2.id !== dragNodeRef.current) {
            n2.vx -= fx;
            n2.vy -= fy;
          }
        });

        // 5. Apply positions, friction, boundaries
        updated.forEach((n) => {
          if (n.id === dragNodeRef.current) return;

          n.vx *= friction;
          n.vy *= friction;

          n.x += n.vx;
          n.y += n.vy;

          // Padding boundaries
          const pad = n.radius + 15;
          if (n.x < pad) { n.x = pad; n.vx = 0; }
          if (n.x > width - pad) { n.x = width - pad; n.vx = 0; }
          if (n.y < pad) { n.y = pad; n.vy = 0; }
          if (n.y > height - pad) { n.y = height - pad; n.vy = 0; }
        });

        return updated;
      });

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [edges]);

  // Draw function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Edges (Friendships)
    edges.forEach((edge) => {
      const u1 = nodes.find((n) => n.id === edge.source);
      const u2 = nodes.find((n) => n.id === edge.target);

      if (!u1 || !u2) return;

      // Check if this edge is part of the highlighted path
      let isPathEdge = false;
      if (highlightedPath.length > 1) {
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          const a = highlightedPath[i];
          const b = highlightedPath[i + 1];
          if ((edge.source === a && edge.target === b) || (edge.source === b && edge.target === a)) {
            isPathEdge = true;
            break;
          }
        }
      }

      // Check if this edge is hovered in eraser mode
      let isEraserHovered = false;
      if (canvasMode === "eraser" && hoveredMousePos) {
        const dist = getDistanceToSegment(hoveredMousePos.x, hoveredMousePos.y, u1.x, u1.y, u2.x, u2.y);
        if (dist < 10) {
          isEraserHovered = true;
        }
      }

      ctx.beginPath();
      ctx.moveTo(u1.x, u1.y);
      ctx.lineTo(u2.x, u2.y);

      if (isEraserHovered) {
        ctx.strokeStyle = "#ef4444"; // Red for eraser hover!
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "rgba(239, 68, 68, 0.4)";
        ctx.shadowBlur = 10;
      } else if (isPathEdge) {
        ctx.strokeStyle = "#6366f1"; // Vibrant Indigo green for path
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "rgba(99, 102, 241, 0.4)";
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = theme === "light" ? "#cbd5e1" : "#1e293b"; // Theme-dependent subtle connections
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    // 2. Draw Nodes (Users)
    nodes.forEach((node) => {
      const isCurrent = activeNode === node.id;
      const isQueued = queueNodes.includes(node.id);
      const isVisited = visitedNodes.includes(node.id);
      const isHovered = hoveredNode === node.id;
      const isSelectedStart = selectedStart === node.id;
      const isSelectedEnd = selectedEnd === node.id;
      const isPartOfPath = highlightedPath.includes(node.id);

      // Determine community color if applicable
      const communityIndex = nodeCommunityMap[node.id];
      const hasCommunity = communityIndex !== undefined;
      const commColor = hasCommunity ? COMMUNITY_COLORS[communityIndex % COMMUNITY_COLORS.length] : null;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      // Node background coloring
      const baseColors = getNodeBaseColors(node.id, theme);
      let fillColor = baseColors.fill;
      let borderColor = baseColors.border;
      let labelColor = baseColors.label;
      let borderWidth = 2;

      if (isSelectedStart) {
        fillColor = theme === "light" ? "#e0e7ff" : "#1e1b4b"; // deep indigo-950
        borderColor = "#6366f1"; // indigo-500
        labelColor = theme === "light" ? "#312e81" : "#ffffff";
        borderWidth = 3;
      } else if (isSelectedEnd) {
        fillColor = theme === "light" ? "#fef3c7" : "#451a03"; // amber-950
        borderColor = "#f59e0b"; // amber-500
        labelColor = theme === "light" ? "#78350f" : "#ffffff";
        borderWidth = 3;
      } else if (isCurrent) {
        fillColor = theme === "light" ? "#fef9c3" : "#422006"; // yellow-950
        borderColor = "#eab308"; // yellow-500
        labelColor = theme === "light" ? "#713f12" : "#ffffff";
        borderWidth = 3;
      } else if (isPartOfPath) {
        fillColor = theme === "light" ? "#d1fae5" : "#064e3b"; // emerald-950
        borderColor = "#10b981"; // emerald-500
        labelColor = theme === "light" ? "#065f46" : "#ffffff";
        borderWidth = 3;
      } else if (isQueued) {
        fillColor = theme === "light" ? "#e0f2fe" : "#082f49"; // sky-950
        borderColor = "#0ea5e9"; // sky-500
        labelColor = theme === "light" ? "#0369a1" : "#ffffff";
        borderWidth = 2.5;
      } else if (isVisited) {
        fillColor = theme === "light" ? "#dcfce7" : "#022c22"; // green-950
        borderColor = "#22c55e"; // green-550
        labelColor = theme === "light" ? "#15803d" : "#cbd5e1";
        borderWidth = 2.5;
      } else if (hasCommunity && commColor) {
        fillColor = theme === "light" ? commColor + "25" : commColor + "15"; // transparent version of community color
        borderColor = commColor;
        labelColor = theme === "light" ? "#0f172a" : "#f1f5f9";
        borderWidth = 3;
      }

      // Special highlight when hovering in eraser mode
      if (canvasMode === "eraser" && isHovered) {
        borderColor = "#ef4444";
        borderWidth = 3;
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;

      // Draw subtle drop shadow for nodes
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = isHovered ? 12 : 6;
      ctx.shadowOffsetY = 2;

      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow
      ctx.stroke();

      // Dotted ring around queued nodes for double visual feedback
      if (isQueued && !isCurrent) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
      }

      // Outer ring around active node
      if (isCurrent) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Outer ring for first selected node in Friendship mode
      if (canvasMode === "create_friendship" && firstSelectedNode === node.id) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw Username Label
      ctx.fillStyle = isHovered ? (theme === "light" ? "#0f172a" : "#ffffff") : labelColor;
      ctx.font = isCurrent || isHovered ? "bold 12px Inter, sans-serif" : "500 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y);

      // Draw secondary role label (e.g. "START", "TARGET", or community number)
      let roleLabel = "";
      if (isSelectedStart) roleLabel = "START";
      else if (isSelectedEnd) roleLabel = "TARGET";
      else if (isCurrent) roleLabel = "ACTIVE";
      else if (hasCommunity) roleLabel = `C-${communityIndex + 1}`;

      if (roleLabel) {
        ctx.font = "bold 9px JetBrains Mono, monospace";
        ctx.fillStyle = isSelectedStart ? "#818cf8" : isSelectedEnd ? "#fbbf24" : commColor ? commColor : "#fef08a";
        ctx.fillText(roleLabel, node.x, node.y + node.radius + 14);
      }
    });
  }, [
    nodes,
    edges,
    activeNode,
    queueNodes,
    visitedNodes,
    highlightedPath,
    nodeCommunityMap,
    hoveredNode,
    selectedStart,
    selectedEnd,
    canvasMode,
    firstSelectedNode,
    hoveredMousePos,
    theme,
  ]);

  // Interaction handlers (Mouse Down to drag or click select)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Detect click on node
    const clickedNode = nodes.find((n) => {
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      return dx * dx + dy * dy < n.radius * n.radius;
    });

    if (canvasMode === "select") {
      if (clickedNode) {
        dragNodeRef.current = clickedNode.id;
        // Notify selection
        if (onSelectNode) {
          onSelectNode(clickedNode.id);
        }
      }
    } else if (canvasMode === "add_person") {
      if (clickedNode) {
        if (onSelectNode) onSelectNode(clickedNode.id);
      } else {
        // Open floating input
        setPendingAddPos({ x: clickX, y: clickY });
      }
    } else if (canvasMode === "create_friendship") {
      if (clickedNode) {
        if (!firstSelectedNode) {
          setFirstSelectedNode(clickedNode.id);
        } else if (firstSelectedNode !== clickedNode.id) {
          if (onAddFriendshipInline) {
            onAddFriendshipInline(firstSelectedNode, clickedNode.id);
          }
          setFirstSelectedNode(null);
        }
      } else {
        setFirstSelectedNode(null);
      }
    } else if (canvasMode === "eraser") {
      if (clickedNode) {
        if (onDeleteUserInline) {
          onDeleteUserInline(clickedNode.id);
        }
      } else {
        // Check if clicked close to an edge
        let clickedEdge: Edge | null = null;
        for (const edge of edges) {
          const u1 = nodes.find((n) => n.id === edge.source);
          const u2 = nodes.find((n) => n.id === edge.target);
          if (u1 && u2) {
            const dist = getDistanceToSegment(clickX, clickY, u1.x, u1.y, u2.x, u2.y);
            if (dist < 10) {
              clickedEdge = edge;
              break;
            }
          }
        }
        if (clickedEdge && onDeleteFriendshipInline) {
          onDeleteFriendshipInline(clickedEdge.source, clickedEdge.target);
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    setHoveredMousePos({ x: currX, y: currY });

    // Handle Dragging
    if (canvasMode === "select" && dragNodeRef.current) {
      setNodes((current) =>
        current.map((n) => {
          if (n.id === dragNodeRef.current) {
            return {
              ...n,
              x: currX,
              y: currY,
              vx: 0,
              vy: 0,
            };
          }
          return n;
        })
      );
      return;
    }

    // Handle Hover checking
    const hitNode = nodes.find((n) => {
      const dx = n.x - currX;
      const dy = n.y - currY;
      return dx * dx + dy * dy < n.radius * n.radius;
    });

    setHoveredNode(hitNode ? hitNode.id : null);
  };

  const handleMouseUpOrLeave = () => {
    dragNodeRef.current = null;
  };

  // Select dynamic HUD text based on active mode
  const getHudText = () => {
    if (canvasMode === "add_person") {
      return language === "hi"
        ? "➕ व्यक्ति जोड़ने के लिए खाली जगह पर क्लिक करें"
        : "➕ Click empty space to add a person";
    }
    if (canvasMode === "create_friendship") {
      if (firstSelectedNode) {
        return language === "hi"
          ? `🤝 कनेक्शन पूरा करने के लिए किसी अन्य व्यक्ति पर क्लिक करें`
          : `🤝 Click another person to connect with ${firstSelectedNode}`;
      }
      return language === "hi"
        ? "🔗 कनेक्शन शुरू करने के लिए पहले व्यक्ति पर क्लिक करें"
        : "🔗 Click the first person to start connection";
    }
    if (canvasMode === "eraser") {
      return language === "hi"
        ? "🗑️ मिटाने के लिए किसी व्यक्ति (नोड) या कनेक्शन (रेखा) पर क्लिक करें"
        : "🗑️ Click a person (node) or connection (line) to erase";
    }
    return language === "hi"
      ? "🖱️ व्यवस्थित करने के लिए खींचें • 👆 प्रारंभ/लक्ष्य चुनने के लिए क्लिक करें"
      : "🖱️ Drag to arrange • 👆 Click to select Start/Target";
  };

  const getCanvasCursor = () => {
    if (canvasMode === "add_person") return "cursor-crosshair";
    if (canvasMode === "create_friendship") return "cursor-cell";
    if (canvasMode === "eraser") return "cursor-no-drop";
    return "cursor-grab active:cursor-grabbing";
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] border border-slate-800 rounded bg-slate-950 overflow-hidden shadow-inner"
      style={{
        backgroundImage: "radial-gradient(#334155 1.5px, transparent 1.5px)",
        backgroundSize: "30px 30px",
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`block w-full h-full ${getCanvasCursor()}`}
      />

      {/* Beautiful Floating Input Dialog in Add Person mode */}
      {pendingAddPos && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!pendingUsername.trim()) return;
            lastClickCoordsRef.current = pendingAddPos;
            if (onAddUserInline) {
              const success = await onAddUserInline(pendingUsername.trim());
              if (success) {
                setPendingAddPos(null);
                setPendingUsername("");
              }
            }
          }}
          className="absolute bg-slate-900/95 border border-indigo-500/80 rounded-lg p-2 flex items-center gap-1.5 shadow-2xl backdrop-blur animate-fade-in z-50"
          style={{
            left: Math.min(pendingAddPos.x, (containerRef.current?.clientWidth || 600) - 200),
            top: Math.min(pendingAddPos.y, (containerRef.current?.clientHeight || 450) - 60),
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder={language === "hi" ? "नाम दर्ज करें..." : "Enter name..."}
            value={pendingUsername}
            onChange={(e) => setPendingUsername(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 w-28"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-2.5 py-1 text-xs font-bold cursor-pointer transition-all"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => setPendingAddPos(null)}
            className="text-slate-400 hover:text-white rounded px-1.5 py-1 text-xs font-bold cursor-pointer transition-all"
          >
            ✕
          </button>
        </form>
      )}

      {/* Beautiful Empty State Overlay */}
      {users.length === 0 && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm ${
          theme === "light" ? "bg-white/85" : "bg-slate-950/85"
        }`}>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 animate-pulse text-sm ${
            theme === "light" ? "bg-slate-100 border border-slate-200 text-slate-600" : "bg-slate-900 border border-slate-800 text-slate-400"
          }`}>
            👤
          </div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 font-mono ${
            theme === "light" ? "text-slate-800" : "text-white"
          }`}>
            {language === "hi" ? "सोशल ग्राफ़ खाली है" : "Social Graph is Empty"}
          </h4>
          <p className={`text-[10px] max-w-xs leading-relaxed ${
            theme === "light" ? "text-slate-600" : "text-slate-400"
          }`}>
            {language === "hi" ? (
              <>एक कस्टम नेटवर्क बनाएं! दाईं ओर <strong className="text-indigo-600 font-bold">व्यक्ति जोड़ें (नोड)</strong> पैनल का उपयोग करके नाम जोड़ें, या डेमो प्रीसेट लोड करें।</>
            ) : (
              <>Create a custom network! Add names using the <strong className="text-indigo-400 font-bold">Add Person (Node)</strong> panel on the right, or load the <strong className="text-indigo-400 font-bold">Demo Preset</strong> to see the sample circle.</>
            )}
          </p>
        </div>
      )}
      
      {/* Dynamic Overlay Info on Hover */}
      {hoveredNode && graph[hoveredNode] && (
        <div className={`absolute top-4 left-4 backdrop-blur-md border rounded p-3 text-xs shadow-2xl font-sans max-w-xs pointer-events-none transition-all animate-fade-in z-40 ${
          theme === "light" ? "bg-white/95 border-slate-200 text-slate-800" : "bg-slate-900/95 border-slate-800 text-slate-300"
        }`}>
          <div className={`font-bold text-sm flex items-center gap-1.5 uppercase tracking-wide ${
            theme === "light" ? "text-slate-950" : "text-white"
          }`}>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            {hoveredNode}
          </div>
          <div className={`mt-1.5 font-mono text-[11px] ${
            theme === "light" ? "text-slate-600" : "text-slate-400"
          }`}>
            {language === "hi" ? "कुल मित्र" : "Total Friends"}: <span className={`font-bold ${theme === "light" ? "text-slate-900" : "text-slate-200"}`}>{graph[hoveredNode].length}</span>
          </div>
          <div className={`mt-1 font-mono text-[11px] max-h-16 overflow-y-auto ${
            theme === "light" ? "text-slate-600" : "text-slate-400"
          }`}>
            {language === "hi" ? "मित्र" : "Friends"}: <span className={`font-medium ${theme === "light" ? "text-slate-850" : "text-slate-300"}`}>{graph[hoveredNode].join(", ") || (language === "hi" ? "कोई नहीं" : "None")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
