import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
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

// Pre-generate animation parameters to avoid impure functions in render
const animationParams = positions.map((_, i) => ({
  duration: 1.5 + Math.random() * 1,
  delay: i * 0.1 + Math.random() * 0.3,
}));

const DOT_COUNT = 108;
const GLOW_RADIUS = 12; // percentage distance

const HeroFireflyIcons = () => {
  const containerRef = useRef(null);
  const [dotPositions, setDotPositions] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Generate random dot positions once
  useEffect(() => {
    const dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }
    setDotPositions(dots);
  }, []);

  // Update mouse position on move
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Compute which dots are within glow radius of mouse
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
      {/* Background dots */}
      {dotPositions.map((pos, i) => {
        const isActive = activeIndices.includes(i);
        return (
          <div
            key={i}
            className={`absolute w-0.5 h-0.5 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-indigo-400/90 shadow-[0_0_10px_rgba(99,102,241,0.9)] scale-150"
                : "bg-indigo-400/30"
            }`}
            style={{
              top: `${pos.y}%`,
              left: `${pos.x}%`,
            }}
          />
        );
      })}

      {/* IT Icons with heartbeat animation */}
      {icons.map((Icon, i) => {
        const [x, y] = positions[i];
        const { duration, delay } = animationParams[i];

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.25, 1, 1.15, 1],
            }}
            transition={{
              duration: duration,
              times: [0, 0.15, 0.3, 0.45, 1],
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            }}
          >
            <div className="p-2 rounded-lg text-indigo-500/70 hover:text-indigo-600 transition-colors">
              <Icon size={18} strokeWidth={1.6} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HeroFireflyIcons;
