// ui.jsx — shared visual primitives (theme-aware).
// All components read theme via React context (provided by App).

const ThemeCtx = React.createContext(null);
const useTheme = () => React.useContext(ThemeCtx);

// ─── Icons (hairline strokes, tactical) ──────────────────────────────────────
const Icon = ({ name, size = 18, stroke = 1.5, color = 'currentColor' }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
              stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'today':    return (<svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><circle cx="12" cy="14" r="1.5" fill={color}/></svg>);
    case 'program':  return (<svg {...p}><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="20" cy="18" r="1.5" fill={color}/></svg>);
    case 'forge':    return (<svg {...p}><path d="M12 3v3M12 18v3M5.5 5.5l2 2M16.5 16.5l2 2M3 12h3M18 12h3M5.5 18.5l2-2M16.5 7.5l2-2"/><circle cx="12" cy="12" r="3"/></svg>);
    case 'stats':    return (<svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>);
    case 'plus':     return (<svg {...p}><path d="M12 5v14M5 12h14"/></svg>);
    case 'check':    return (<svg {...p}><path d="M5 12l5 5L20 7"/></svg>);
    case 'x':        return (<svg {...p}><path d="M6 6l12 12M18 6l-12 12"/></svg>);
    case 'chev':     return (<svg {...p}><path d="M9 6l6 6-6 6"/></svg>);
    case 'chevD':    return (<svg {...p}><path d="M6 9l6 6 6-6"/></svg>);
    case 'minus':    return (<svg {...p}><path d="M5 12h14"/></svg>);
    case 'bolt':     return (<svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>);
    case 'flame':    return (<svg {...p}><path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 0 2-2 3-3 3 0-3-2-5-2-8-3 2-6 6-6 11 0 4 3 8 8 8z"/></svg>);
    case 'target':   return (<svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color}/></svg>);
    case 'cal':      return (<svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case 'timer':    return (<svg {...p}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 3h6M5 6l-1.5-1.5M19 6l1.5-1.5"/></svg>);
    case 'edit':     return (<svg {...p}><path d="M4 20l4-1 11-11-3-3-11 11-1 4z"/></svg>);
    case 'grip':     return (<svg {...p}><circle cx="9" cy="6" r="1.2" fill={color} stroke="none"/><circle cx="15" cy="6" r="1.2" fill={color} stroke="none"/><circle cx="9" cy="12" r="1.2" fill={color} stroke="none"/><circle cx="15" cy="12" r="1.2" fill={color} stroke="none"/><circle cx="9" cy="18" r="1.2" fill={color} stroke="none"/><circle cx="15" cy="18" r="1.2" fill={color} stroke="none"/></svg>);
    case 'shield':   return (<svg {...p}><path d="M12 3l8 3v6c0 4-3 8-8 9-5-1-8-5-8-9V6l8-3z"/></svg>);
    case 'arrowUp':  return (<svg {...p}><path d="M12 19V5M5 12l7-7 7 7"/></svg>);
    case 'sliders':  return (<svg {...p}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h14M22 18h-2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/></svg>);
    case 'menu':     return (<svg {...p}><circle cx="5" cy="12" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="19" cy="12" r="1.5" fill={color}/></svg>);
    case 'play':     return (<svg {...p}><path d="M7 5l12 7-12 7V5z" fill={color} stroke="none"/></svg>);
    case 'lib':      return (<svg {...p}><path d="M4 4v16M8 4v16M12 4v16M18 6l3 14-4 1L14 7l4-1z"/></svg>);
    case 'goal':     return (<svg {...p}><path d="M4 21V4l8 3-2 4 10 2-5 4-3 8z"/></svg>);
    default: return null;
  }
};

// ─── Card ───────────────────────────────────────────────────────────────────
const Card = ({ children, style, padding, onClick, accent }) => {
  const t = useTheme();
  const d = t.density;
  return (
    <div onClick={onClick} style={{
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: d.cardR,
      padding: padding ?? d.pad,
      position: 'relative',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
          background: accent, borderRadius: `${d.cardR}px 0 0 ${d.cardR}px`,
        }} />
      )}
      {children}
    </div>
  );
};

// ─── Section header — eyebrow + title row ───────────────────────────────────
const Section = ({ eyebrow, title, action, children, style }) => {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {(eyebrow || title || action) && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                       gap: 10, padding: '0 4px' }}>
          <div style={{ minWidth: 0, flex: '0 1 auto' }}>
            {eyebrow && (
              <div style={{ fontFamily: t.mono, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
                            color: t.fgDim, marginBottom: 2, whiteSpace: 'nowrap' }}>{eyebrow}</div>
            )}
            {title && (
              <div style={{ fontFamily: t.ui, fontSize: t.density.h2, fontWeight: t.displayWeight, color: t.fg, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>{title}</div>
            )}
          </div>
          {action && <div style={{ flex: '0 0 auto', minWidth: 0 }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// ─── Pill / badge ───────────────────────────────────────────────────────────
const Pill = ({ children, tone = 'mute', solid = false, mono = true, style }) => {
  const t = useTheme();
  const tones = {
    mute:    { bg: t.surface2,  fg: t.fgMute,  bd: t.line },
    accent:  { bg: t.accentDim, fg: t.accent,  bd: 'transparent' },
    signal:  { bg: t.signalDim, fg: t.signal,  bd: 'transparent' },
    success: { bg: 'rgba(93,199,167,0.16)', fg: t.success, bd: 'transparent' },
    solid:   { bg: t.fg, fg: t.bg, bd: 'transparent' },
  };
  const c = solid ? tones.solid : tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: c.bg, color: c.fg,
      border: `1px solid ${c.bd}`,
      fontFamily: mono ? t.mono : t.ui,
      fontSize: 10, fontWeight: 600, letterSpacing: mono ? 0.4 : 0,
      textTransform: mono ? 'uppercase' : 'none',
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
};

// ─── Button ─────────────────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', size = 'md', icon, onClick, style, disabled }) => {
  const t = useTheme();
  const variants = {
    primary:   { bg: t.fg, fg: t.bg, bd: 'transparent' },
    accent:    { bg: t.accent, fg: '#fff', bd: 'transparent' },
    signal:    { bg: t.signal, fg: '#0a0a0c', bd: 'transparent' },
    ghost:     { bg: 'transparent', fg: t.fg, bd: t.lineStrong },
    quiet:     { bg: t.surface2, fg: t.fg, bd: t.line },
  };
  const sizes = {
    sm: { h: 30, px: 12, fs: 12 },
    md: { h: 40, px: 16, fs: 13 },
    lg: { h: 52, px: 20, fs: 15 },
  };
  const v = variants[variant]; const s = sizes[size];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      height: s.h, padding: `0 ${s.px}px`, borderRadius: s.h / 2,
      background: v.bg, color: v.fg, border: `1px solid ${v.bd}`,
      fontFamily: t.ui, fontWeight: 600, fontSize: s.fs, letterSpacing: 0.1,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      transition: 'transform 120ms cubic-bezier(.3,.7,.4,1), opacity 120ms',
      ...style,
    }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {icon && <Icon name={icon} size={s.fs + 3} stroke={2} />}
      {children}
    </button>
  );
};

// ─── KV (label + monospace value) ───────────────────────────────────────────
const KV = ({ label, value, unit, color, big = false, style }) => {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      <div style={{ fontFamily: t.mono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: t.fgDim }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: t.mono, fontSize: big ? 28 : 18, fontWeight: 600, color: color || t.fg, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontFamily: t.mono, fontSize: big ? 12 : 10, color: t.fgMute, textTransform: 'lowercase' }}>{unit}</span>}
      </div>
    </div>
  );
};

// ─── Number stepper ────────────────────────────────────────────────────────
const Stepper = ({ value, onChange, step = 1, min, max, suffix, width = 96 }) => {
  const t = useTheme();
  const set = (v) => {
    if (min != null && v < min) v = min;
    if (max != null && v > max) v = max;
    onChange(Math.round(v * 1000) / 1000);
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'stretch',
      border: `1px solid ${t.lineStrong}`, borderRadius: 8,
      background: t.surface2, height: 32, width,
    }}>
      <button onClick={() => set(value - step)} style={{
        width: 28, background: 'transparent', border: 0, color: t.fgMute, cursor: 'pointer'
      }}><Icon name="minus" size={14} stroke={2} /></button>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
        fontFamily: t.mono, fontVariantNumeric: 'tabular-nums', fontSize: 13, color: t.fg, fontWeight: 600
      }}>
        {value}{suffix && <span style={{ color: t.fgDim, fontSize: 10, marginLeft: 2 }}>{suffix}</span>}
      </div>
      <button onClick={() => set(value + step)} style={{
        width: 28, background: 'transparent', border: 0, color: t.fgMute, cursor: 'pointer'
      }}><Icon name="plus" size={14} stroke={2} /></button>
    </div>
  );
};

// ─── Group dot — colored marker for group ───────────────────────────────────
const GroupDot = ({ id, size = 8 }) => {
  const t = useTheme();
  const map = { big: t.accent, medium: t.signal, small: '#7ab8ff', cardio: t.success };
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: size, background: map[id] || t.fgMute }} />;
};

// ─── Tabs / Bottom navigation ───────────────────────────────────────────────
const BottomTabs = ({ value, onChange, items }) => {
  const t = useTheme();
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '0 12px 12px', zIndex: 40,
      background: `linear-gradient(to top, ${t.bg} 60%, transparent)`,
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', gap: 4, justifyContent: 'space-between',
        background: t.surface, border: `1px solid ${t.line}`,
        borderRadius: 999, padding: 6,
        pointerEvents: 'auto',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      }}>
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button key={it.id} onClick={() => onChange(it.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '8px 6px', border: 0, borderRadius: 999,
              background: active ? t.fg : 'transparent',
              color: active ? t.bg : t.fgMute,
              cursor: 'pointer', transition: 'background 160ms, color 160ms',
              fontFamily: t.ui, fontSize: 9, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase'
            }}>
              <Icon name={it.icon} size={18} stroke={active ? 2 : 1.5} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Top-bar (status / brand) ───────────────────────────────────────────────
const TopBar = ({ title, sub, right }) => {
  const t = useTheme();
  return (
    <div style={{
      padding: '18px 20px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontFamily: t.mono, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: t.fgDim, marginBottom: 4 }}>{sub}</div>
        <div style={{ fontFamily: t.ui, fontSize: t.density.h1, fontWeight: t.displayWeight, color: t.fg, letterSpacing: -0.5, lineHeight: 1 }}>{title}</div>
      </div>
      {right}
    </div>
  );
};

// ─── Brand mark — minimalist bat-cowl glyph ────────────────────────────────
// Single stroked diamond/cape silhouette; works on light & dark.
const Brand = ({ size = 18 }) => {
  const t = useTheme();
  return (
    <svg width={size * 2.2} height={size} viewBox="0 0 44 20" fill="none">
      <path d="M2 4 C 8 4, 12 8, 14 12 C 16 8, 18 6, 22 6 C 26 6, 28 8, 30 12 C 32 8, 36 4, 42 4 L 38 14 L 30 12 L 22 17 L 14 12 L 6 14 Z"
            fill={t.fg} />
    </svg>
  );
};

// ─── Tiny sparkline (for stats cards) ──────────────────────────────────────
const Sparkline = ({ data, width = 80, height = 24, color }) => {
  const t = useTheme();
  if (!data || data.length === 0) return null;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={color || t.accent} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ children, show }) => {
  const t = useTheme();
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 110, zIndex: 50,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 200ms, transform 200ms',
    }}>
      <div style={{
        background: t.fg, color: t.bg,
        borderRadius: 999, padding: '10px 16px',
        fontFamily: t.mono, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600,
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      }}>{children}</div>
    </div>
  );
};

// ─── Phone shell — Android (Material 3 frame, dark-theme-friendly) ─────────
// Boxy 18px-radius bezel with thin frame, centered punch-hole camera, status
// bar (time + status icons), gesture nav pill at the bottom. Pure dark to
// match the Wayne Tactical aesthetic.
const PhoneShell = ({ children, width = 412, height = 892 }) => {
  const t = useTheme();
  return (
    <div style={{
      width, height, borderRadius: 44, position: 'relative', overflow: 'hidden',
      background: t.bg,
      border: '2px solid #2a2a2e',
      boxShadow: `
        0 0 0 8px #111114,
        0 0 0 10px #2c2c30,
        0 50px 100px rgba(0,0,0,0.6),
        0 20px 60px rgba(0,0,0,0.4)`,
      fontFamily: t.ui,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* status bar */}
      <div style={{
        height: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 22px 0', position: 'relative', zIndex: 90,
      }}>
        <span style={{ fontFamily: t.ui, fontWeight: 500, fontSize: 13, color: t.fg, letterSpacing: 0.2 }}>9:41</span>
        {/* punch-hole camera */}
        <div style={{
          position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
          width: 22, height: 22, borderRadius: 100, background: '#000',
          border: '1px solid #1a1a1d',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: t.fg }}>
          {/* signal triangles + wifi + battery (Android M3 style) */}
          <svg width="14" height="11" viewBox="0 0 16 13"><path d="M8 12L0.5 4.5a10.6 10.6 0 0115 0L8 12z" fill="currentColor"/></svg>
          <svg width="14" height="11" viewBox="0 0 16 13"><path d="M14 12V1L1 12h13z" fill="currentColor"/></svg>
          <svg width="15" height="11" viewBox="0 0 16 13">
            <rect x="3.5" y="1.5" width="9" height="11" rx="1.2" fill="currentColor"/>
            <rect x="5.5" y="0" width="5" height="1.8" rx="0.4" fill="currentColor"/>
          </svg>
        </div>
      </div>
      {/* content */}
      <div style={{ flex: 1, overflow: 'hidden', background: t.bg, position: 'relative' }}>
        {children}
      </div>
      {/* gesture nav pill */}
      <div style={{
        height: 22, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 110, background: t.bg,
      }}>
        <div style={{
          width: 122, height: 4, borderRadius: 100, background: t.fg, opacity: 0.5,
        }} />
      </div>
    </div>
  );
};

// ─── Confirm dialog — modal with title + body + OK/Cancel ───────────────────
// Overlays its nearest positioned ancestor (inset:0). Pair with a positioned
// wrapper for scope. Shared between Active (finish-session) and Catalogue
// (deploy-program) confirms.
const ConfirmDialog = ({ title, body, okLabel, cancelLabel, onOk, onCancel, okTone = 'accent' }) => {
  const t = useTheme();
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'dialogIn 160ms cubic-bezier(.3,.7,.4,1)',
    }}>
      <style>{`@keyframes dialogIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div style={{
        background: t.surface, border: `1px solid ${t.line}`,
        borderRadius: 16, padding: 18, width: '100%', maxWidth: 340,
      }}>
        <div style={{ fontFamily: t.ui, fontSize: 16, fontWeight: 700, color: t.fg, marginBottom: 6 }}>{title}</div>
        <div style={{ fontFamily: t.mono, fontSize: 11, color: t.fgMute, marginBottom: 16, lineHeight: 1.5 }}>{body}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="quiet" size="md" style={{ flex: 1 }} onClick={onCancel}>{cancelLabel}</Btn>
          <Btn variant={okTone} size="md" style={{ flex: 1 }} onClick={onOk}>{okLabel}</Btn>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  ThemeCtx, useTheme, Icon, Card, Section, Pill, Btn, KV, Stepper,
  GroupDot, BottomTabs, TopBar, Brand, Sparkline, Toast, PhoneShell,
  ConfirmDialog,
});
