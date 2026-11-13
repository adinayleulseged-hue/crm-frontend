/**
 * INSA Logo — SVG recreation of the official
 * Information Network Security Administration mark.
 *
 * Props:
 *   size   — px size (width = height). Default 40.
 *   white  — when true, renders a white-on-transparent variant for dark backgrounds.
 */
export default function InsaLogo({ size = 40, white = false }: { size?: number; white?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="INSA – Information Network Security Administration"
      fill="none"
    >
      {/* ── Shield outline ── */}
      {/* Left half: red→purple gradient */}
      <defs>
        <linearGradient id="shieldL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={white ? "rgba(255,255,255,0.9)" : "#c8102e"} />
          <stop offset="100%" stopColor={white ? "rgba(255,255,255,0.5)" : "#7b2ff7"} />
        </linearGradient>
        <linearGradient id="shieldR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={white ? "rgba(255,255,255,0.6)" : "#7b2ff7"} />
          <stop offset="100%" stopColor={white ? "rgba(255,255,255,0.9)" : "#1d4ed8"} />
        </linearGradient>
        <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={white ? "rgba(255,255,255,0.4)" : "#7b2ff7"} />
          <stop offset="100%" stopColor={white ? "rgba(255,255,255,0.7)" : "#3b1fa8"} />
        </linearGradient>
      </defs>

      {/* Shield left stroke */}
      <path
        d="M100 10 L20 42 L20 110 C20 152 55 180 100 192"
        stroke="url(#shieldL)"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Shield right stroke */}
      <path
        d="M100 10 L180 42 L180 110 C180 152 145 180 100 192"
        stroke="url(#shieldR)"
        strokeWidth="8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Eye / PIN shape ── */}
      {/* Outer white ring */}
      <circle cx="100" cy="78" r="34" fill={white ? "rgba(255,255,255,0.15)" : "white"} />
      {/* Red ring */}
      <circle cx="100" cy="78" r="28" fill={white ? "rgba(255,100,80,0.8)" : "#c8102e"} />
      {/* White inner ring */}
      <circle cx="100" cy="78" r="20" fill={white ? "rgba(255,255,255,0.2)" : "white"} />
      {/* Dark blue pupil */}
      <circle cx="100" cy="78" r="13" fill="url(#eyeGrad)" />
      {/* Pupil highlight */}
      <circle cx="95" cy="73" r="4" fill={white ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.45)"} />

      {/* Pin stem */}
      <rect x="95" y="108" width="10" height="28" rx="4" fill={white ? "rgba(255,255,255,0.6)" : "#4c1d95"} />

      {/* ── Circuit board lines below pin ── */}
      {/* Line 1 */}
      <line x1="92" y1="136" x2="92" y2="155" stroke={white ? "rgba(255,255,255,0.5)" : "#1e293b"} strokeWidth="2" strokeLinecap="round" />
      <circle cx="92" cy="158" r="3" fill={white ? "rgba(255,255,255,0.7)" : "#c8102e"} />

      {/* Line 2 */}
      <line x1="97" y1="136" x2="97" y2="148" stroke={white ? "rgba(255,255,255,0.5)" : "#1e293b"} strokeWidth="2" strokeLinecap="round" />
      <rect x="94" y="149" width="6" height="6" rx="1" fill={white ? "rgba(255,255,255,0.6)" : "#1e293b"} />

      {/* Line 3 */}
      <line x1="103" y1="136" x2="103" y2="152" stroke={white ? "rgba(255,255,255,0.5)" : "#1e293b"} strokeWidth="2" strokeLinecap="round" />
      <circle cx="103" cy="155" r="3" fill={white ? "rgba(255,255,255,0.7)" : "#1e293b"} />

      {/* Line 4 */}
      <line x1="108" y1="136" x2="108" y2="144" stroke={white ? "rgba(255,255,255,0.5)" : "#1e293b"} strokeWidth="2" strokeLinecap="round" />
      <line x1="108" y1="144" x2="116" y2="144" stroke={white ? "rgba(255,255,255,0.5)" : "#1e293b"} strokeWidth="2" strokeLinecap="round" />
      <rect x="115" y="141" width="5" height="5" rx="1" fill={white ? "rgba(255,255,255,0.6)" : "#1e293b"} />
    </svg>
  );
}
