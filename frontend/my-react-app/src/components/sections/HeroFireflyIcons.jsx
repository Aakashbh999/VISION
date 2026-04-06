import { useState, useRef, useMemo } from "react";
import {
  Code2,
  Database,
  Cloud,
  Shield,
  Brain,
  Cpu,
  Server,
  Smartphone,
  Lock,
  Globe,
  Terminal,
  Wifi,
} from "lucide-react";

const icons = [
  Code2,
  Database,
  Cloud,
  Shield,
  Brain,
  Cpu,
  Server,
  Smartphone,
  Lock,
  Globe,
  Terminal,
  Wifi,
];

const positions = [
  [12, 20],
  [30, 15],
  [55, 18],
  [80, 25],
  [18, 45],
  [40, 40],
  [70, 45],
  [85, 60],
  [25, 70],
  [50, 75],
  [72, 80],
  [15, 82],
];

const DOT_COUNT = 108;
const GLOW_RADIUS = 12;
const INITIAL_DOT_POSITIONS = Array.from({ length: DOT_COUNT }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

const HeroFireflyIcons = () => {
  const containerRef = useRef(null);
  const [dotPositions] = useState(INITIAL_DOT_POSITIONS);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const activeIndices = useMemo(() => {
    if (!isHovering) return [];
    const indices = [];
    for (let i = 0; i < dotPositions.length; i++) {
      const dot = dotPositions[i];
      const dx = dot.x - mousePos.x;
      const dy = dot.y - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= GLOW_RADIUS) {
        indices.push(i);
      }
    }
    return indices;
  }, [mousePos, dotPositions, isHovering]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 sm:h-72 lg:h-80 overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovering(false)}
    >
      {dotPositions.map((pos, i) => {
        const isActive = activeIndices.includes(i);
        return (
          <div
            key={i}
            className={`absolute w-0.5 h-0.5 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-purple-400/90 shadow-[0_0_10px_rgba(168,85,247,0.9)] scale-150"
                : "bg-purple-400/30"
            }`}
            style={{
              top: `${pos.y}%`,
              left: `${pos.x}%`,
            }}
          />
        );
      })}

      {icons.map((Icon, i) => {
        const [x, y] = positions[i];

        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="p-2 rounded-lg text-purple-500/70 hover:text-purple-600 transition-colors">
              <Icon size={18} strokeWidth={1.6} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HeroFireflyIcons;
