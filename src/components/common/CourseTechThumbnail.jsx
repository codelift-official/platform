import React from 'react';
import {
  SiPython,
  SiReact,
  SiPostgresql,
  SiJavascript,
  SiNodedotjs,
  SiCplusplus
} from 'react-icons/si';
import {
  FaCode,
  FaDatabase,
  FaTerminal,
  FaChartBar,
  FaCloud,
  FaBrain,
  FaMobileAlt,
  FaLaptopCode
} from 'react-icons/fa';

/**
 * Intelligently resolves the technology icon, labels, colors, and gradients
 * based on category, categoryId, and course metadata.
 */
export function resolveCourseTech(course = {}, category = null) {
  const catId = ((category?.id || course.categoryId || course.category_id || '') + '').toLowerCase();
  const catName = ((category?.name || '') + '').toLowerCase();
  const catIcon = ((category?.icon || '') + '').toLowerCase();
  const title = ((course.title || '') + '').toLowerCase();
  const desc = ((course.description || '') + '').toLowerCase();

  // 1. Python
  if (
    catIcon === 'python' ||
    catId.includes('python') ||
    catName.includes('python') ||
    title.includes('python') ||
    title.includes('fastapi') ||
    title.includes('django') ||
    desc.includes('python')
  ) {
    return {
      id: 'python',
      name: 'Python',
      label: 'PYTHON',
      Icon: SiPython,
      accent: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.28)',
      bg: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 45%, #021a29 100%)',
      boxClass: 'cat-python'
    };
  }

  // 2. React / Modern Web / Frontend
  if (
    catIcon === 'react' ||
    catId.includes('react') ||
    catId === 'cat-web' ||
    catName.includes('react') ||
    catName.includes('web') ||
    title.includes('react') ||
    title.includes('frontend') ||
    title.includes('next.js') ||
    title.includes('full stack') ||
    title.includes('web')
  ) {
    return {
      id: 'react',
      name: 'React & Web',
      label: 'REACT / WEB',
      Icon: SiReact,
      accent: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.28)',
      bg: 'linear-gradient(135deg, #083344 0%, #164e63 45%, #021c27 100%)',
      boxClass: 'cat-web'
    };
  }

  // 3. Database / SQL / Backend
  if (
    catIcon === 'database' ||
    catIcon === 'db' ||
    catId.includes('db') ||
    catId.includes('sql') ||
    catId.includes('database') ||
    catName.includes('database') ||
    catName.includes('sql') ||
    title.includes('sql') ||
    title.includes('postgres') ||
    title.includes('database') ||
    desc.includes('database') ||
    desc.includes('sql')
  ) {
    return {
      id: 'database',
      name: 'Database & SQL',
      label: 'SQL / DB',
      Icon: SiPostgresql,
      accent: '#60a5fa',
      glow: 'rgba(96, 165, 250, 0.28)',
      bg: 'linear-gradient(135deg, #172554 0%, #1e3a8a 45%, #0a1329 100%)',
      boxClass: 'cat-sql'
    };
  }

  // 4. Data Science & Analytics
  if (
    catIcon === 'chart' ||
    catIcon === 'data' ||
    catId.includes('data') ||
    catId.includes('analytics') ||
    catName.includes('data') ||
    catName.includes('analytics') ||
    title.includes('data') ||
    title.includes('analytics') ||
    desc.includes('analytics')
  ) {
    return {
      id: 'data',
      name: 'Data Science',
      label: 'DATA SCIENCE',
      Icon: FaChartBar,
      accent: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.28)',
      bg: 'linear-gradient(135deg, #451a03 0%, #78350f 45%, #1f0b02 100%)',
      boxClass: 'cat-data'
    };
  }

  // 5. Artificial Intelligence & ML
  if (
    catIcon === 'ai' ||
    catId.includes('ai') ||
    catId.includes('ml') ||
    catName.includes('intelligence') ||
    catName.includes('ai') ||
    title.includes('ai') ||
    title.includes('machine learning') ||
    title.includes('llm') ||
    desc.includes('machine learning')
  ) {
    return {
      id: 'ai',
      name: 'Artificial Intelligence',
      label: 'AI / ML',
      Icon: FaBrain,
      accent: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.28)',
      bg: 'linear-gradient(135deg, #3b0764 0%, #581c87 45%, #1b0330 100%)',
      boxClass: 'cat-ai'
    };
  }

  // 6. DevOps & Cloud
  if (
    catIcon === 'cloud' ||
    catId.includes('cloud') ||
    catId.includes('devops') ||
    catName.includes('cloud') ||
    catName.includes('devops') ||
    title.includes('cloud') ||
    title.includes('devops') ||
    title.includes('docker') ||
    title.includes('aws')
  ) {
    return {
      id: 'cloud',
      name: 'Cloud & DevOps',
      label: 'DEVOPS / CLOUD',
      Icon: FaCloud,
      accent: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.28)',
      bg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 45%, #022030 100%)',
      boxClass: 'cat-cloud'
    };
  }

  // 7. Mobile Development
  if (
    catIcon === 'mobile' ||
    catId.includes('mobile') ||
    catName.includes('mobile') ||
    title.includes('mobile') ||
    title.includes('flutter') ||
    title.includes('android') ||
    title.includes('ios')
  ) {
    return {
      id: 'mobile',
      name: 'Mobile Development',
      label: 'MOBILE DEV',
      Icon: FaMobileAlt,
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.28)',
      bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 45%, #02261d 100%)',
      boxClass: 'cat-mobile'
    };
  }

  // 8. Core CS / Algorithms / DSA
  if (
    catIcon === 'terminal' ||
    catId.includes('core') ||
    catName.includes('core') ||
    title.includes('dsa') ||
    title.includes('algorithm') ||
    title.includes('data structure') ||
    title.includes('c++')
  ) {
    return {
      id: 'core',
      name: 'Core CS & DSA',
      label: 'CORE CS / DSA',
      Icon: FaTerminal,
      accent: '#4ade80',
      glow: 'rgba(74, 222, 128, 0.28)',
      bg: 'linear-gradient(135deg, #14532d 0%, #15803d 45%, #042910 100%)',
      boxClass: 'cat-core'
    };
  }

  // 9. Node.js / JavaScript
  if (
    catIcon === 'node' ||
    catId.includes('node') ||
    title.includes('node') ||
    title.includes('javascript') ||
    title.includes('typescript')
  ) {
    return {
      id: 'node',
      name: 'Node.js & JavaScript',
      label: 'NODE / JS',
      Icon: SiNodedotjs,
      accent: '#4ade80',
      glow: 'rgba(74, 222, 128, 0.25)',
      bg: 'linear-gradient(135deg, #052e16 0%, #14532d 45%, #021a0d 100%)',
      boxClass: 'cat-node'
    };
  }

  // 10. Default / Generic Software Engineering
  return {
    id: 'software',
    name: 'Software Engineering',
    label: (catName || 'ENGINEERING').toUpperCase(),
    Icon: FaLaptopCode,
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.2)',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #090d16 100%)',
    boxClass: 'cat-default'
  };
}

/**
 * Modern Technology Course Thumbnail.
 * Replaces stock Unsplash images with rich technology icons, dynamic ambient gradients,
 * and high-aesthetic dev styling.
 */
export default function CourseTechThumbnail({
  course,
  category = null,
  height = 190,
  width,
  compact = false,
  className = '',
  style = {},
  children
}) {
  const tech = resolveCourseTech(course, category);
  const IconComponent = tech.Icon;

  if (compact) {
    return (
      <div
        className={`position-relative overflow-hidden d-flex align-items-center justify-content-center text-white ${className}`}
        style={{
          width: width || 72,
          height: height || 56,
          background: tech.bg,
          border: `1px solid ${tech.accent}33`,
          borderRadius: 10,
          boxShadow: `0 4px 14px ${tech.glow}`,
          flexShrink: 0,
          ...style
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
            opacity: 0.6
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            color: tech.accent,
            fontSize: '1.6rem',
            filter: `drop-shadow(0 2px 8px ${tech.glow})`
          }}
        >
          <IconComponent />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`position-relative overflow-hidden d-flex flex-column align-items-center justify-content-center text-white ${className}`}
      style={{
        width: width || '100%',
        height: height || 190,
        background: tech.bg,
        borderBottom: `1px solid ${tech.accent}30`,
        position: 'relative',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Background Dot Matrix Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      {/* Ambient Glow Orb */}
      <div
        style={{
          position: 'absolute',
          width: 170,
          height: 170,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tech.glow} 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      />

      {/* Central Glassmorphic Tech Icon Pod */}
      <div
        className="d-flex align-items-center justify-content-center shadow-lg"
        style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1.5px solid ${tech.accent}55`,
          color: tech.accent,
          fontSize: '2.5rem',
          position: 'relative',
          zIndex: 2,
          boxShadow: `0 8px 30px ${tech.glow}`
        }}
      >
        <IconComponent />
      </div>

      {/* Bottom Technology Watermark Badge */}
      <div
        className="position-absolute bottom-0 start-50 translate-middle-x mb-2 px-2.5 py-0.5 rounded-pill shadow-sm"
        style={{
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: `1px solid ${tech.accent}40`,
          color: tech.accent,
          fontSize: '0.66rem',
          fontWeight: 700,
          letterSpacing: '0.75px',
          zIndex: 2,
          textTransform: 'uppercase'
        }}
      >
        {tech.label}
      </div>

      {/* Overlays / Children (e.g. badges, live indicators) */}
      {children}
    </div>
  );
}
