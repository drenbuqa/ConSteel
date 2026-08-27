"use client";

import { useState } from "react";

interface Segment {
  color: string;
  pct: number;
  label: string;
  value: string;
}

interface DonutChartProps {
  segments: Segment[];
  centerLabel: string;
  centerValue: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number
): string {
  if (endDeg - startDeg >= 360) endDeg = startDeg + 359.99;
  const o1 = polarToCartesian(cx, cy, outerR, startDeg);
  const o2 = polarToCartesian(cx, cy, outerR, endDeg);
  const i1 = polarToCartesian(cx, cy, innerR, endDeg);
  const i2 = polarToCartesian(cx, cy, innerR, startDeg);
  const la = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${la} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${la} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

function nudgedPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number,
  nudge: number
): string {
  const midDeg = (startDeg + endDeg) / 2;
  const midRad = ((midDeg - 90) * Math.PI) / 180;
  return donutPath(
    cx + Math.cos(midRad) * nudge,
    cy + Math.sin(midRad) * nudge,
    outerR, innerR, startDeg, endDeg
  );
}

export default function DonutChart({ segments, centerLabel, centerValue }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const cx = 105, cy = 105;
  const outerR = 85, innerR = 56;
  const nudge = 6;

  let angle = 0;
  const paths = segments.map((seg) => {
    const start = angle;
    const end = angle + (seg.pct / 100) * 360;
    angle = end;
    return { ...seg, start, end };
  });

  const hovSeg = hovered !== null ? paths[hovered] : null;

  return (
    <svg
      width="210" height="210"
      viewBox="0 0 210 210"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      {paths.map((seg, i) => {
        if (seg.pct === 0) return null;
        const isHov = hovered === i;
        const isDim = hovered !== null && !isHov;

        // Visual path — nudges on hover but has no pointer events
        const visualD = isHov
          ? nudgedPath(cx, cy, outerR + 4, innerR, seg.start, seg.end, nudge)
          : donutPath(cx, cy, outerR, innerR, seg.start, seg.end);

        // Hit area — never moves, so the hover state never flickers
        const hitD = donutPath(cx, cy, outerR + 4, innerR, seg.start, seg.end);

        return (
          <g key={i}>
            <path
              d={visualD}
              fill={seg.color}
              opacity={isDim ? 0.35 : 1}
              style={{
                pointerEvents: "none",
                transition: "opacity 0.18s, filter 0.18s",
                filter: isHov ? "drop-shadow(0 3px 10px rgba(0,0,0,0.22))" : "none",
              }}
            />
            {/* Invisible stable hit area — events stay here, path never moves */}
            <path
              d={hitD}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          </g>
        );
      })}

      {/* Center text */}
      <text
        x={cx} y={cy - 7}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={hovSeg ? (hovSeg.value.length > 10 ? "11" : "13") : (centerValue.length > 10 ? "11" : "13")}
        fontWeight="700" fill="#111827" fontFamily="Inter, sans-serif"
      >
        {hovSeg ? hovSeg.value : centerValue}
      </text>
      <text
        x={cx} y={cy + 11}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8.5" fill="#9CA3AF" fontFamily="Inter, sans-serif"
      >
        {hovSeg ? hovSeg.label : centerLabel}
      </text>
    </svg>
  );
}
