import React from "react";

/**
 * Ambient fantasy layer mounted once at the app root: a handful of flowers
 * bloom in with staggered delays on first load, and fireflies drift forever
 * after. Purely decorative — fixed, pointer-events: none, and fully inert
 * under prefers-reduced-motion (see .magic-overlay rules in index.css).
 */

interface BloomSpec {
  left: string;
  top: string;
  size: number;
  delay: number;
  hue: "blossom" | "teal" | "gold";
}

const BLOOMS: BloomSpec[] = [
  { left: "4%", top: "78%", size: 90, delay: 0, hue: "blossom" },
  { left: "14%", top: "18%", size: 60, delay: 220, hue: "teal" },
  { left: "88%", top: "70%", size: 100, delay: 120, hue: "blossom" },
  { left: "92%", top: "22%", size: 56, delay: 340, hue: "gold" },
  { left: "46%", top: "90%", size: 70, delay: 460, hue: "teal" },
  { left: "62%", top: "8%", size: 50, delay: 580, hue: "gold" },
];

const HUE_COLORS: Record<BloomSpec["hue"], { petal: string; petalDeep: string; center: string }> = {
  blossom: { petal: "#ff8fc7", petalDeep: "#c14f8f", center: "#ffd76e" },
  teal: { petal: "#3ddad0", petalDeep: "#1f8f8a", center: "#f1e6ff" },
  gold: { petal: "#f2c675", petalDeep: "#c9924a", center: "#ff8fc7" },
};

function Flower({ size, hue }: { size: number; hue: BloomSpec["hue"] }) {
  const colors = HUE_COLORS[hue];
  const petals = 6;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g transform="translate(50 50)">
        {Array.from({ length: petals }).map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-24"
            rx="14"
            ry="24"
            fill={colors.petal}
            stroke={colors.petalDeep}
            strokeWidth="1"
            opacity={0.85}
            transform={`rotate(${(360 / petals) * i})`}
          />
        ))}
        <circle r="10" fill={colors.center} />
      </g>
    </svg>
  );
}

export default function MagicOverlay() {
  const fireflies = React.useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53 + 10) % 100}%`,
        drift: 6 + (i % 5),
        fade: 3 + (i % 4),
        delay: i * 0.4,
      })),
    []
  );

  return (
    <div className="magic-overlay" aria-hidden="true">
      {BLOOMS.map((bloom, i) => (
        <div
          key={i}
          className="magic-overlay__bloom"
          style={{
            left: bloom.left,
            top: bloom.top,
            animationDelay: `${bloom.delay}ms`,
          }}
        >
          <Flower size={bloom.size} hue={bloom.hue} />
        </div>
      ))}
      {fireflies.map((f, i) => (
        <span
          key={i}
          className="magic-overlay__firefly"
          style={{
            left: f.left,
            top: f.top,
            animationDuration: `${f.drift}s, ${f.fade}s`,
            animationDelay: `${f.delay}s, ${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
