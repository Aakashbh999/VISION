import { useState, useRef, useMemo, useEffect } from "react";
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
  const [glowingIndices, setGlowingIndices] = useState([]);

  // Helper to get N unique random indices
  function getRandomIndices(count, max) {
    const indices = new Set();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * max));
    }
    return Array.from(indices);
  }

  useEffect(() => {
    // Pick a random number between 20 and 30
    function pickRandomGlow() {
      const count = Math.floor(Math.random() * 11) + 20; // 20 to 30
      setGlowingIndices(getRandomIndices(count, dotPositions.length));
    }
    pickRandomGlow();
    const interval = setInterval(pickRandomGlow, 1500); // Change every 1.5s
    return () => clearInterval(interval);
  }, [dotPositions.length]);

  // Heartbeat: only one icon at a time
  const [heartbeatIndex, setHeartbeatIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeatIndex((prev) => (prev + 1) % icons.length);
    }, 1200); // 1.2s per icon
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 sm:h-72 lg:h-80 overflow-hidden"
    >
      {dotPositions.map((pos, i) => {
        const isActive = glowingIndices.includes(i);
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
        const isBeating = i === heartbeatIndex;
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
            <div
              className={`p-2 rounded-lg text-purple-500/70 hover:text-purple-600 transition-colors${isBeating ? " animate-heartbeat" : ""}`}
              style={
                isBeating
                  ? {
                      animation: "heartbeat 1.1s cubic-bezier(0.4, 0, 0.6, 1)",
                    }
                  : {}
              }
            >
              <Icon size={18} strokeWidth={1.6} />
            </div>
          </div>
        );
      })}
      {/* Heartbeat keyframes style */}
      <style>{`
      @keyframes heartbeat {
        0% { transform: scale(1); }
        20% { transform: scale(1.32); }
        40% { transform: scale(1); }
        100% { transform: scale(1); }
      }
    `}</style>
    </div>
  );
};

export default HeroFireflyIcons;
