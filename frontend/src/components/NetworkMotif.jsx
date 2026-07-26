// Decorative node-and-edge motif echoing a co-authorship network graph —
// the visual signature of the Scientific Collaboration Network Analyzer.
export default function NetworkMotif({ className = "", style = {} }) {
  const nodes = [
    { x: 60, y: 70, r: 5 },
    { x: 180, y: 40, r: 7 },
    { x: 290, y: 100, r: 4 },
    { x: 120, y: 160, r: 6 },
    { x: 250, y: 200, r: 5 },
    { x: 340, y: 60, r: 4 },
    { x: 40, y: 220, r: 4 },
    { x: 200, y: 260, r: 6 },
    { x: 320, y: 240, r: 4 },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [3, 0],
    [3, 4],
    [4, 7],
    [7, 3],
    [2, 5],
    [4, 8],
    [3, 6],
  ];

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 380 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={i % 3 === 0 ? "#d98e3f" : "#ffffff"}
          fillOpacity={i % 3 === 0 ? 0.9 : 0.55}
        />
      ))}
    </svg>
  );
}
