import React from 'react';
import {
  SiPython, SiJavascript, SiHtml5, SiCss as SiCss3, SiReact,
  SiNodedotjs, SiMongodb, SiOpenjdk, SiC, SiCplusplus,
  SiMysql, SiFlask, SiPostgresql, SiGit, SiDocker,
} from 'react-icons/si';
import './RadarRings.css';

// 15 Technology Planets across 3 concentric layers
const PLANETS = [
  // Inner ring — 200px — 3 planets 120° apart (speed 24s)
  { id: 'python', Icon: SiPython,      label: 'Python',     layer: 'inner', angle: 0,   radius: 200, speed: 24, brandColor: '#3776AB' },
  { id: 'js',     Icon: SiJavascript,  label: 'JavaScript', layer: 'inner', angle: 120, radius: 200, speed: 24, brandColor: '#F7DF1E' },
  { id: 'html',   Icon: SiHtml5,       label: 'HTML5',      layer: 'inner', angle: 240, radius: 200, speed: 24, brandColor: '#E34F26' },

  // Mid ring — 340px — 4 planets 90° apart (speed 36s)
  { id: 'css',    Icon: SiCss3,        label: 'CSS3',       layer: 'mid',   angle: 0,   radius: 340, speed: 36, brandColor: '#1572B6' },
  { id: 'react',  Icon: SiReact,       label: 'React',      layer: 'mid',   angle: 90,  radius: 340, speed: 36, brandColor: '#61DAFB' },
  { id: 'node',   Icon: SiNodedotjs,   label: 'Node.js',    layer: 'mid',   angle: 180, radius: 340, speed: 36, brandColor: '#339933' },
  { id: 'mongo',  Icon: SiMongodb,     label: 'MongoDB',    layer: 'mid',   angle: 270, radius: 340, speed: 36, brandColor: '#47A248' },

  // Outer ring — 480px — 8 planets 45° apart (speed 56s)
  { id: 'java',   Icon: SiOpenjdk,     label: 'Java',       layer: 'outer', angle: 0,   radius: 480, speed: 56, brandColor: '#F89820' },
  { id: 'c',      Icon: SiC,           label: 'C',          layer: 'outer', angle: 45,  radius: 480, speed: 56, brandColor: '#A8B9CC' },
  { id: 'cpp',    Icon: SiCplusplus,   label: 'C++',        layer: 'outer', angle: 90,  radius: 480, speed: 56, brandColor: '#00599C' },
  { id: 'mysql',  Icon: SiMysql,       label: 'MySQL',      layer: 'outer', angle: 135, radius: 480, speed: 56, brandColor: '#4479A1' },
  { id: 'flask',  Icon: SiFlask,       label: 'Flask',      layer: 'outer', angle: 180, radius: 480, speed: 56, brandColor: '#10B981' },
  { id: 'pg',     Icon: SiPostgresql,  label: 'PostgreSQL', layer: 'outer', angle: 225, radius: 480, speed: 56, brandColor: '#336791' },
  { id: 'git',    Icon: SiGit,         label: 'Git',        layer: 'outer', angle: 270, radius: 480, speed: 56, brandColor: '#F05032' },
  { id: 'docker', Icon: SiDocker,      label: 'Docker',     layer: 'outer', angle: 315, radius: 480, speed: 56, brandColor: '#2496ED' },
];

// Deterministic 110-star layout (stable across all renders)
const STARS = Array.from({ length: 110 }, (_, i) => {
  const x = ((i * 37 + 13) % 100);
  const y = ((i * 59 + 29) % 100);
  const size = 1.5 + ((i * 7) % 3); // 1.5 to 3.5px
  const duration = (2.2 + ((i * 11) % 21) / 10).toFixed(1); // 2.2s to 4.3s
  const delay = (((i * 17) % 30) / 10).toFixed(1); // 0.0s to 3.0s
  return { id: i, x, y, size, duration, delay };
});

export default function RadarRings({
  showLabels = true,
  nucleusSize = 'lg',      // 'sm' | 'md' | 'lg'
  hideAngles = [],
  variant = 'home',        // 'home' | 'login'
  className = '',
}) {
  const visiblePlanets = hideAngles && hideAngles.length > 0
    ? PLANETS.filter((p) => !hideAngles.includes(p.angle))
    : PLANETS;

  return (
    <div
      className={`radar-rings nucleus-${nucleusSize} variant-${variant} ${variant === 'login' ? 'login-variant' : ''} ${className}`}
      aria-hidden="true"
    >
      {/* 4 Concentric Ring Orbits */}
      <div className="rr-ring rr-ring-inner" />
      <div className="rr-ring rr-ring-mid" />
      <div className="rr-ring rr-ring-outer" />
      <div className="rr-ring rr-ring-nucleus" />

      {/* Radar Sweep Arm & Trail */}
      <div className="rr-sweep-wrap">
        <div className="rr-sweep-arm" />
      </div>
      <div className="rr-sweep-trail" />

      {/* Deterministic Twinkling Stars Layer (above rings/sweep, below planets) */}
      <div className="rr-stars-layer">
        {STARS.map((s) => (
          <span
            key={s.id}
            className="rr-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Orbiting Planets (Layer A -> Layer B -> Layer C) */}
      {visiblePlanets.map((p) => (
        <div
          key={p.id}
          className={`rr-planet-wrapper rr-layer-${p.layer}`}
          style={{
            '--angle': `${p.angle}deg`,
            '--radius': `${p.radius}px`,
            '--speed': `${p.speed}s`,
            '--brand-color': p.brandColor,
          }}
        >
          {/* Layer B: Counter-rotation canceling Layer A's angle */}
          <div className="rr-planet-counter">
            {/* Layer C: Static translate(-50%, -50%) positioning container */}
            <div className="rr-planet-inner">
              <div className="rr-planet-icon" title={p.label}>
                <p.Icon />
              </div>
              {showLabels && <span className="rr-planet-label">{p.label}</span>}
            </div>
          </div>
        </div>
      ))}

      {/* Center Nucleus */}
      <div className="rr-nucleus">
        <div className="rr-nucleus-pulse" />
        <div className="rr-nucleus-pulse rr-nucleus-pulse-2" />
        <div className="rr-nucleus-core">
          <span className="rr-nucleus-logo">CodeLift</span>
        </div>
      </div>
    </div>
  );
}
