"use client";

import { useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useAuth } from "@clerk/nextjs";

export default function ForceGraphComponent({ repoId }: { repoId: string }) {
  const { getToken } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>();

  useEffect(() => {
    if (fgRef.current) {
      // Increase repulsion so the radial layout has plenty of breathing room
      fgRef.current.d3Force('charge').strength(-400);
    }
  }, [graphData]);
  
  // Custom colors for nodes
  const NODE_COLORS = {
    file: "#6366f1",    // Indigo
    class: "#10b981",   // Emerald
    method: "#ec4899",  // Pink
    function: "#f59e0b",// Amber
    module: "#64748b"   // Slate
  };

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://127.0.0.1:8000/api/v1/repos/${repoId}/graph`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGraphData(data.graph);
        }
      } catch (e) {
        console.error("Failed to load graph", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [repoId, getToken]);

  if (loading) return <div className="flex h-full items-center justify-center text-slate-400">Loading Architecture Map...</div>;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl bg-[#0B1120]">
      {/* Premium Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
        <h3 className="text-white text-sm font-semibold mb-3">Node Types</h3>
        <div className="space-y-2">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
              <span className="text-slate-300 text-xs capitalize font-medium">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="id"
        nodeRelSize={6}
        dagMode="radialout"
        dagLevelDistance={120}
        linkColor={() => "rgba(255,255,255,0.25)"}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        backgroundColor="#0B1120"
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 12 / globalScale;
          const color = NODE_COLORS[node.type as keyof typeof NODE_COLORS] || "#cbd5e1";
          
          // Draw Glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
          ctx.fillStyle = `${color}40`; // 25% opacity for glow
          ctx.fill();

          // Draw Node Core
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();

          // Draw Text Label if zoomed in
          if (globalScale > 1.2) {
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fillText(label, node.x, node.y + 12);
          }
        }}
      />
    </div>
  );
}
