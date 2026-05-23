// screen-today.jsx — Active tab: session timer + per-exercise logging with
// inline < > steppers for weight, reps, sets. Designed for use mid-workout:
// big touch targets, glanceable timer, one-tap completion.

// ─── Drag-reorder hook ──────────────────────────────────────────────────────
// Pointer-event based vertical reorder. The drag handle button captures the
// pointer on down, so all subsequent move/up events route to that same
// element — so all pointer handlers live in the bundle returned by
// getHandleProps(id). Cards swap as the dragged card's center crosses a
// neighbor's; on each swap we reset startFingerY so the card snaps to the
// new slot's natural position (= where the finger already is).
function useReorderable(ids, onReorder) {
  const [drag, setDrag] = React.useState(null); // { id, pointerId, startFingerY, fingerY }
  const refs = React.useRef({});
  const setRef = React.useCallback((id) => (el) => {
    if (el) refs.current[id] = el; else delete refs.current[id];
  }, []);

  const getHandleProps = (id) => ({
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      setDrag({ id, pointerId: e.pointerId, startFingerY: e.clientY, fingerY: e.clientY });
    },
    onPointerMove: (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const fingerY = e.clientY;
      const fromIdx = ids.indexOf(drag.id);
      if (fromIdx < 0) return;
      const draggedEl = refs.current[drag.id];
      if (!draggedEl) { setDrag((d) => d ? { ...d, fingerY } : d); return; }
      const draggedRect = draggedEl.getBoundingClientRect();
      const cardCenter = draggedRect.top + draggedRect.height / 2;
      let toIdx = fromIdx;
      for (let i = 0; i < ids.length; i++) {
        if (i === fromIdx) continue;
        const el = refs.current[ids[i]];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const otherCenter = r.top + r.height / 2;
        if (i < fromIdx && cardCenter < otherCenter) { toIdx = i; break; }
        if (i > fromIdx && cardCenter > otherCenter) { toIdx = i; }
      }
      if (toIdx !== fromIdx) {
        onReorder(fromIdx, toIdx);
        setDrag((d) => d ? { ...d, fingerY, startFingerY: fingerY } : d);
      } else {
        setDrag((d) => d ? { ...d, fingerY } : d);
      }
    },
    onPointerUp: (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      setDrag(null);
    },
    onPointerCancel: (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      setDrag(null);
    },
  });

  return { drag, getHandleProps, setRef };
}

// ─── Live elapsed-time hook ─────────────────────────────────────────────────
// Re-renders every second while the session is active; returns total ms.
function useElapsed(session) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (!session || session.state !== 'active') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session?.state]);
  if (!session || session.state === 'idle') return 0;
  if (session.state === 'paused') return session.accumMs;
  return session.accumMs + (now - (session.startedAt || now));
}

function fmtDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ─── Session bar — Start / Pause+Finish / Resume+Finish ─────────────────────
const SessionBar = ({ session, units, onStart, onPause, onResume, onFinish }) => {
  const t = useTheme();
  const T = useT();
  const elapsed = useElapsed(session);
  const state = session?.state || 'idle';

  if (state === 'idle') {
    return (
      <div style={{ padding: '8px 16px 4px' }}>
        <button onClick={onStart} style={{
          width: '100%', height: 56,
          background: t.accent, color: '#fff', border: 0, borderRadius: 14,
          fontFamily: t.ui, fontSize: 16, fontWeight: 700, letterSpacing: 0.2,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: `0 6px 20px ${t.accentDim}`,
        }}>
          <Icon name="play" size={18} color="#fff" />
          {T('session.start')}
        </button>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginTop: 6,
          textAlign: 'center', letterSpacing: 0.4,
        }}>
          {T('session.idle.hint')}
        </div>
      </div>
    );
  }

  const isPaused = state === 'paused';
  return (
    <div style={{ padding: '8px 16px 4px' }}>
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: 8, height: 56,
      }}>
        {/* Pause / Resume */}
        <button onClick={isPaused ? onResume : onPause} style={{
          width: 56, background: t.surface2, border: `1px solid ${t.lineStrong}`,
          borderRadius: 14, color: t.fg, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {isPaused
            ? <Icon name="play" size={20} color={t.fg} />
            : <svg width="14" height="18" viewBox="0 0 14 18"><rect x="0" y="0" width="5" height="18" rx="1" fill={t.fg}/><rect x="9" y="0" width="5" height="18" rx="1" fill={t.fg}/></svg>}
        </button>

        {/* Timer cell — two columns: STARTED AT (left) / ELAPSED (right) */}
        <div style={{
          flex: 1, background: isPaused ? t.surface : t.surface2,
          border: `1px solid ${isPaused ? t.line : t.lineStrong}`,
          borderRadius: 14,
          display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden', padding: '7px 12px',
        }}>
          <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>

          {/* Left: STARTED AT */}
          {session.firstStartedAt ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', minWidth: 0 }}>
              <div style={{
                fontFamily: t.mono, fontSize: 8, color: t.fgDim,
                letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1,
              }}>{T('common.startedAt')}</div>
              <div style={{
                fontFamily: t.mono, fontSize: 10, color: t.fgMute,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.25, marginTop: 4,
              }}>{fmtDate(session.firstStartedAt, units)}</div>
              <div style={{
                fontFamily: t.mono, fontSize: 10, color: t.fgMute,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.25,
              }}>{fmtTime(session.firstStartedAt, units)}</div>
            </div>
          ) : <div />}

          {/* Right: ELAPSED — pulse dot inline with label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {!isPaused && (
                <span style={{
                  width: 5, height: 5, borderRadius: 5, background: t.accent,
                  animation: 'pulse 1.6s ease-in-out infinite',
                }} />
              )}
              <div style={{
                fontFamily: t.mono, fontSize: 8, color: t.fgDim,
                letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1,
              }}>{isPaused ? T('run.status.paused') : T('session.elapsed')}</div>
            </div>
            <div style={{
              fontFamily: t.mono, fontSize: 22, fontWeight: 700,
              color: isPaused ? t.fgMute : t.fg, fontVariantNumeric: 'tabular-nums',
              lineHeight: 1, letterSpacing: 0.5, marginTop: 4,
            }}>{fmtDuration(elapsed)}</div>
          </div>
        </div>

        {/* Finish */}
        <button onClick={onFinish} style={{
          width: 56, background: t.fg, border: 0, borderRadius: 14, color: t.bg,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="check" size={22} stroke={2.5} color={t.bg} />
        </button>
      </div>
    </div>
  );
};

// ─── Compact stepper — used inside set rows ─────────────────────────────────
// Designed for one-handed gym use: 42px tall, 32px-wide tap targets on each
// side, big chevrons. The value sits centered both axes.
const SetStepper = ({ value, unit, step, min, max, onChange, color, mono = true }) => {
  const t = useTheme();
  const clamp = (v) => Math.max(min ?? -Infinity, Math.min(max ?? Infinity, v));
  const dec = () => onChange(Math.round(clamp(value - step) * 100) / 100);
  const inc = () => onChange(Math.round(clamp(value + step) * 100) / 100);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: t.surface2, border: `1px solid ${t.line}`, borderRadius: 10,
      height: 42, width: '100%', overflow: 'hidden',
    }}>
      <button onClick={dec} style={{
        width: 34, height: '100%', background: 'transparent', border: 0,
        color: t.fgMute, cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} aria-label="decrease">
        <LeftChev color={t.fg} size={18} />
      </button>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
        height: '100%',
        fontFamily: mono ? t.mono : t.ui, fontSize: 16, fontWeight: 700,
        color: color || t.fg, fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        <span>{value}</span>
        {unit && <span style={{ fontSize: 9, color: t.fgDim, fontWeight: 500, textTransform: 'lowercase' }}>{unit}</span>}
      </div>
      <button onClick={inc} style={{
        width: 34, height: '100%', background: 'transparent', border: 0,
        color: t.fgMute, cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} aria-label="increase">
        <RightChev color={t.fg} size={18} />
      </button>
    </div>
  );
};
const RightChev = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6"/>
  </svg>
);
const LeftChev = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 6l-6 6 6 6"/>
  </svg>
);

// ─── Set row — per-set steppers (W / R) + done button ───────────────────────
// Each set tracks its own weight + reps. When marked done, kicks off a rest
// countdown (handled by parent).
const SetRow = ({ idx, weight, reps, wStep, wMin, units,
                  done, current, onDone, onWeight, onReps,
                  modified, density }) => {
  const t = useTheme();
  const T = useT();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '22px minmax(0, 1.5fr) minmax(0, 1fr) 42px',
      alignItems: 'center', gap: 8,
      padding: `${density === 'compact' ? 6 : 7}px 0`,
      borderTop: `1px solid ${t.line}`,
      opacity: done ? 0.6 : 1,
      transition: 'opacity 160ms',
    }}>
      <span style={{
        fontFamily: t.mono, fontSize: 11, color: current ? t.accent : t.fgDim,
        fontWeight: 700, letterSpacing: 1,
      }}>{String(idx + 1).padStart(2, '0')}</span>

      <SetStepper value={weight}
                  step={wStep} min={wMin ?? 0}
                  onChange={onWeight}
                  color={modified?.weight ? t.signal : t.fg} />

      <SetStepper value={reps}
                  step={1} min={1} max={50}
                  onChange={onReps}
                  color={modified?.reps ? t.signal : t.fg} />

      <button onClick={onDone} style={{
        width: 42, height: 42, borderRadius: 10,
        background: done ? t.success : 'transparent',
        border: `1px solid ${done ? t.success : t.lineStrong}`,
        color: done ? t.bg : t.fgMute,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 140ms, border-color 140ms',
      }} aria-label="mark set done">
        {done ? <Icon name="check" size={20} stroke={2.8} color={t.bg} /> : null}
      </button>
    </div>
  );
};

// ─── Rest countdown bar — sticky inside the expanded exercise body ──────────
const RestCountdown = ({ totalSec, startedAt, onSkip }) => {
  const t = useTheme();
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const elapsedMs = now - startedAt;
  const remainingMs = Math.max(0, totalSec * 1000 - elapsedMs);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const pct = Math.min(100, (elapsedMs / (totalSec * 1000)) * 100);
  const isDone = remainingMs <= 0;
  return (
    <div style={{
      marginTop: 10, padding: '8px 10px', borderRadius: 10,
      background: isDone ? `${t.success}22` : t.surface2,
      border: `1px solid ${isDone ? t.success : t.lineStrong}`,
      display: 'flex', alignItems: 'center', gap: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* progress fill */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: `${pct}%`,
        background: isDone ? `${t.success}33` : `${t.accent}22`,
        transition: 'width 200ms linear',
      }} />
      <Icon name="timer" size={16} color={isDone ? t.success : t.accent} />
      <span style={{
        position: 'relative', fontFamily: t.mono, fontSize: 11, color: t.fgMute,
        letterSpacing: 0.6, textTransform: 'uppercase',
      }}>{isDone ? 'GO' : 'REST'}</span>
      <span style={{
        position: 'relative', fontFamily: t.mono, fontSize: 16, fontWeight: 700,
        color: isDone ? t.success : t.fg, fontVariantNumeric: 'tabular-nums',
        marginLeft: 'auto',
      }}>
        {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}
      </span>
      <button onClick={onSkip} style={{
        position: 'relative',
        padding: '4px 10px', borderRadius: 6,
        background: t.fg, color: t.bg, border: 0, cursor: 'pointer',
        fontFamily: t.mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
      }}>skip</button>
    </div>
  );
};

// ─── Exercise card — header + per-set rows + rest countdown ─────────────────
const ExerciseCard = ({ ex, group, units, round, program, density, restOn = true, defaultRestSec = 180,
                        doneArr, setDoneArr, actuals, onActuals, onSetActuals,
                        expanded, onToggle,
                        dragHandleProps, onRemove, dragging }) => {
  const t = useTheme();
  const T = useT();

  // Plan (projected) vs actual (logged overrides)
  const projected = projectedKg(ex, group, round, program);
  const plannedKgSnap = snapForUnits(projected, group, ex.equip, 'kg');
  const plannedWeight = Number(fmtWeight(plannedKgSnap, units));
  // For freshly-added exercises we honour actuals.defaultReps (set to 8 at
  // add-time) so the prescribed-reps display reads 8 even though the seed
  // exercise has its own canonical rep count (e.g. bench = 5).
  const plannedReps = actuals?.defaultReps ?? ex.reps;
  const plannedSets = ex.sets;
  const wStep = weightStep(ex, units);

  // Sets count override (exercise-level) + per-set overrides
  const setsCount = actuals?.sets ?? plannedSets;
  const perSet = actuals?.perSet || {};
  const valueAt = (i) => ({
    weight: perSet[i]?.weight ?? plannedWeight,
    reps:   perSet[i]?.reps   ?? plannedReps,
  });
  const modAt = (i) => ({
    weight: perSet[i]?.weight !== undefined,
    reps:   perSet[i]?.reps !== undefined,
  });

  const doneCount = (doneArr || []).filter(Boolean).length;
  const allDone = doneCount === setsCount;
  const isRecovery = round % program.recovery.every === 0;
  const isModified = !!actuals && (actuals.sets !== undefined || Object.keys(perSet).length > 0);

  // Rest countdown — local to this exercise; resets on every Done tap.
  const [rest, setRest] = React.useState(null); // { setIdx, startedAt }
  // When the rest toggle flips OFF, kill any in-progress countdown.
  React.useEffect(() => { if (!restOn) setRest(null); }, [restOn]);

  const handleSetDone = (i) => {
    const arr = (doneArr || Array(setsCount).fill(false)).slice();
    while (arr.length < setsCount) arr.push(false);
    const wasDone = !!arr[i];
    arr[i] = !arr[i];
    setDoneArr(arr);
    // Start rest if we just marked DONE (not when undoing) — only if rest toggle is on.
    if (!wasDone && restOn) setRest({ setIdx: i, startedAt: Date.now() });
    else setRest(null);
  };

  const addSet = () => onActuals({ sets: setsCount + 1 });
  const removeSet = () => onActuals({ sets: Math.max(1, setsCount - 1) });

  // Summary string — show range if per-set weights differ.
  const weights = Array.from({ length: setsCount }, (_, i) => valueAt(i).weight);
  const reps = Array.from({ length: setsCount }, (_, i) => valueAt(i).reps);
  const minW = Math.min(...weights), maxW = Math.max(...weights);
  const minR = Math.min(...reps), maxR = Math.max(...reps);
  const weightSummary = minW === maxW ? `${minW}` : `${minW}–${maxW}`;
  const repSummary    = minR === maxR ? `${minR}` : `${minR}–${maxR}`;

  return (
    <Card padding={0} accent={allDone ? t.success : isModified ? t.signal : undefined}>
      {/* Header — drag handle | tappable content | remove */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {dragHandleProps && (
          <button {...dragHandleProps}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="drag to reorder"
                  style={{
                    width: 26, alignSelf: 'stretch',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 0,
                    color: t.fgDim, cursor: dragging ? 'grabbing' : 'grab',
                    touchAction: 'none', flexShrink: 0,
                    padding: 0,
                  }}>
            <Icon name="grip" size={16} color={dragging ? t.fg : t.fgDim} />
          </button>
        )}
        <div onClick={onToggle} style={{
          flex: 1, minWidth: 0,
          paddingTop: density === 'compact' ? 12 : 16,
          paddingBottom: density === 'compact' ? 12 : 16,
          paddingLeft: dragHandleProps ? 0 : (density === 'compact' ? 14 : 16),
          paddingRight: onRemove ? 0 : (density === 'compact' ? 14 : 16),
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: t.surface2, border: `1px solid ${t.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GroupDot id={group.id} size={10} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontFamily: t.ui, fontWeight: 600, fontSize: 15, color: t.fg, letterSpacing: -0.1 }}>
                {T(ex.nameKey)}
              </span>
              {isRecovery && <Pill tone="signal">{T('common.deloadCaps')}</Pill>}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: t.mono, fontSize: 11, color: t.fgMute, fontVariantNumeric: 'tabular-nums' }}>
                {setsCount}×{repSummary} · {weightSummary} {unitLabel(units)}
              </span>
              <span style={{ fontFamily: t.mono, fontSize: 11, color: t.fgDim }}>· {T(equipKey(ex.equip))}</span>
            </div>
          </div>
          <div style={{
            fontFamily: t.mono, fontSize: 11, color: allDone ? t.success : t.fgMute,
            fontVariantNumeric: 'tabular-nums', fontWeight: 600,
          }}>{doneCount}/{setsCount}</div>
          <Icon name={expanded ? 'chevD' : 'chev'} size={16} color={t.fgDim} />
        </div>
        {onRemove && (
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  aria-label="remove exercise"
                  style={{
                    width: 32, alignSelf: 'stretch',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 0,
                    borderLeft: `1px solid ${t.line}`,
                    color: t.fgDim, cursor: 'pointer',
                    flexShrink: 0, padding: 0,
                  }}>
            <Icon name="x" size={14} color={t.fgDim} />
          </button>
        )}
      </div>

      {/* Expanded body — per-set steppers + rest countdown */}
      {expanded && (
        <div style={{ padding: `0 ${density === 'compact' ? 14 : 16}px ${density === 'compact' ? 10 : 14}px` }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '22px minmax(0, 1.5fr) minmax(0, 1fr) 42px',
            alignItems: 'center', gap: 8,
            padding: `${density === 'compact' ? 6 : 8}px 0 4px`,
            borderTop: `1px solid ${t.line}`,
          }}>
            <span style={{ fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 1.2, textTransform: 'uppercase' }}>set</span>
            <span style={{ fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center' }}>
              weight · {unitLabel(units)}
            </span>
            <span style={{ fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center' }}>
              {T('common.reps')}
            </span>
            <span />
          </div>

          {/* Per-set rows; rest panel renders inline right after the completed set */}
          {Array.from({ length: setsCount }, (_, i) => {
            const v = valueAt(i);
            return (
              <React.Fragment key={i}>
                <SetRow idx={i}
                        weight={v.weight} reps={v.reps}
                        wStep={wStep} wMin={0} units={units}
                        density={density}
                        modified={modAt(i)}
                        done={(doneArr || [])[i]}
                        current={!((doneArr || [])[i]) && i === doneCount}
                        onWeight={(w) => onSetActuals(i, { weight: w })}
                        onReps={(r) => onSetActuals(i, { reps: r })}
                        onDone={() => handleSetDone(i)} />
                {restOn && rest?.setIdx === i && (
                  <RestCountdown totalSec={defaultRestSec} startedAt={rest.startedAt}
                                 onSkip={() => setRest(null)} />
                )}
              </React.Fragment>
            );
          })}

          {/* Add-set button (unchecking achieves "do fewer sets") */}
          <button onClick={addSet} style={{
            width: '100%', height: 32, marginTop: 8, borderRadius: 8,
            background: t.surface2, border: `1px dashed ${t.lineStrong}`,
            color: t.fgMute, cursor: 'pointer',
            fontFamily: t.mono, fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="plus" size={14} stroke={2} /> {T('today.sets')}
          </button>

          {/* Footer hint — just the next-cycle bump preview now (rest lives in brief card) */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <div style={{ flex: 1 }} />
            <span style={{
              fontFamily: t.mono, fontSize: 10, color: t.fgDim,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>{T('common.next')}: +{(group.formula.amount * (units === 'lb' ? 2.20462 : 1)).toFixed(2).replace(/\.?0+$/, '')}{units === 'lb' ? 'lb' : group.formula.unit}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Add-exercise picker — bottom sheet, grouped exercise list ──────────────
// Tap one to add it to today's list (with the "classic" 3×8 default — the
// add handler in app.jsx seeds `actuals.defaultReps = 8` and `sets = 3`).
const ExercisePicker = ({ onPick, onClose, currentIds = [] }) => {
  const t = useTheme();
  const T = useT();
  const [query, setQuery] = React.useState('');

  const q = query.trim().toLowerCase();
  const byGroup = SEED_GROUPS.map((g) => ({
    group: g,
    exercises: SEED_EXERCISES.filter((e) => e.group === g.id).filter((e) => {
      if (!q) return true;
      return T(e.nameKey).toLowerCase().includes(q);
    }),
  })).filter((entry) => entry.exercises.length > 0);
  const total = byGroup.reduce((n, e) => n + e.exercises.length, 0);

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 70,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'pickerBgIn 200ms ease-out',
    }}>
      <style>{`
        @keyframes pickerBgIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pickerSheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: t.bg,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        borderTop: `1px solid ${t.lineStrong}`,
        maxHeight: '82%', display: 'flex', flexDirection: 'column',
        animation: 'pickerSheetIn 240ms cubic-bezier(.3,.7,.4,1)',
      }}>
        {/* grab handle */}
        <div style={{ padding: '8px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.lineStrong }} />
        </div>
        {/* header */}
        <div style={{
          padding: '6px 16px 10px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: t.ui, fontSize: 17, fontWeight: 700, color: t.fg,
              letterSpacing: -0.2,
            }}>{T('picker.title')}</div>
            <div style={{
              fontFamily: t.mono, fontSize: 10, color: t.fgDim,
              marginTop: 3, letterSpacing: 0.4,
            }}>{T('picker.sub')}</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            background: t.surface2, border: `1px solid ${t.line}`,
            color: t.fg, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }} aria-label="close">
            <Icon name="x" size={16} stroke={2} />
          </button>
        </div>
        {/* search */}
        <div style={{ padding: '0 16px 8px' }}>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder={T('picker.search')} autoFocus={false}
                 style={{
                   width: '100%', height: 40, borderRadius: 10,
                   background: t.surface2, border: `1px solid ${t.line}`,
                   color: t.fg, fontFamily: t.mono, fontSize: 13,
                   padding: '0 12px', outline: 'none',
                 }} />
        </div>
        {/* list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 18px' }}>
          {total === 0 && (
            <div style={{
              padding: '40px 0', textAlign: 'center',
              fontFamily: t.mono, fontSize: 11, color: t.fgDim,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>{T('picker.empty')}</div>
          )}
          {byGroup.map(({ group: g, exercises }) => (
            <div key={g.id} style={{ marginBottom: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 2px 8px',
                fontFamily: t.mono, fontSize: 10, color: t.fgDim,
                letterSpacing: 1.2, textTransform: 'uppercase',
              }}>
                <GroupDot id={g.id} size={6} />
                <span>{T(g.nameKey)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {exercises.map((e) => {
                  const inToday = currentIds.includes(e.id);
                  return (
                    <button key={e.id} onClick={() => onPick(e.id)}
                            style={{
                              width: '100%', textAlign: 'left',
                              padding: '10px 12px', borderRadius: 10,
                              background: t.surface, border: `1px solid ${t.line}`,
                              color: t.fg, cursor: 'pointer', fontFamily: 'inherit',
                              display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: t.surface2, border: `1px solid ${t.line}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <GroupDot id={e.group} size={8} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: t.ui, fontWeight: 600, fontSize: 13.5,
                          color: t.fg, letterSpacing: -0.1,
                        }}>{T(e.nameKey)}</div>
                        <div style={{
                          fontFamily: t.mono, fontSize: 10, color: t.fgDim,
                          marginTop: 2, letterSpacing: 0.2,
                        }}>{T(equipKey(e.equip))}</div>
                      </div>
                      {inToday && <Pill tone="mute">{T('picker.alreadyIn')}</Pill>}
                      <Icon name="plus" size={14} color={t.fgMute} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Active screen ──────────────────────────────────────────────────────────
const ScreenToday = ({ units, program, run, density,
                       onLog, startSession, pauseSession, resumeSession, finishSession,
                       setActuals, setSetActuals,
                       onAddExercise, onRemoveExercise, onReorderExercises, onRestoreDefault }) => {
  const t = useTheme();
  const T = useT();
  const [expanded, setExpanded] = React.useState(null);
  const [confirmFinish, setConfirmFinish] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [restOn, setRestOn] = React.useState(true);
  const [defaultRestSec, setDefaultRestSec] = React.useState(180);

  const log = run.log || {};
  const round = run.currentRound;
  const dayIdx = run.currentDayIdx;
  const day = program.days[dayIdx];
  const session = run.session || { state: 'idle' };

  // Effective list (respects per-run day overrides). Memoize id-list for
  // the reorder hook so ids identity is stable across renders that don't
  // change the list.
  const exerciseIds = effectiveDayExercises(run, program, dayIdx);
  const exercises = exerciseIds.map((id) => exerciseInRun(id, run)).filter(Boolean);
  const dayOverridden = isDayOverridden(run, dayIdx);
  const isRecoveryRound = round % program.recovery.every === 0;

  const reorder = useReorderable(exerciseIds, (from, to) => onReorderExercises && onReorderExercises(from, to));

  const logKey = (exId) => `${exId}-r${round}-d${dayIdx}`;
  const getDoneArr = (exId) => log[logKey(exId)] || [];
  const setDoneArr = (exId, arr) => {
    const next = { ...log, [logKey(exId)]: arr };
    onLog && onLog(next);
  };
  const getActuals = (exId) => (run.actuals || {})[logKey(exId)];

  // Stats — aware of per-set actuals.
  const totalSets = exercises.reduce((s, e) => {
    const a = getActuals(e.id);
    return s + (a?.sets ?? e.sets);
  }, 0);
  const doneSets = exercises.reduce((s, e) => s + getDoneArr(e.id).filter(Boolean).length, 0);
  const doneVolume = exercises.reduce((s, e) => {
    const g = findGroup(e.group);
    const a = getActuals(e.id);
    const perSet = a?.perSet || {};
    const plannedW = snapForUnits(projectedKg(e, g, round, program), g, e.equip, 'kg');
    const doneArr = getDoneArr(e.id);
    let vol = 0;
    const setCount = a?.sets ?? e.sets;
    for (let i = 0; i < setCount; i++) {
      if (!doneArr[i]) continue;
      const w = perSet[i]?.weight !== undefined
        ? perSet[i].weight * (units === 'lb' ? 0.45359237 : 1)
        : plannedW;
      const reps = perSet[i]?.reps ?? a?.defaultReps ?? e.reps;
      vol += w * reps;
    }
    return s + vol;
  }, 0);

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Scrollable content */}
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 110 }}>
        {/* Brand bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Brand size={14} />
            <span style={{
              fontFamily: t.mono, fontSize: 10, color: t.fgDim, letterSpacing: 1.4, textTransform: 'uppercase',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220,
            }}>{T(program.nameKey)}</span>
          </div>
          {isRecoveryRound && <Pill tone="signal">◇ {T('common.deloadCaps')}</Pill>}
        </div>

        {/* Mesocycle preview — strip when session running, calendar otherwise */}
        <MesoPreview program={program} run={run} units={units}
                     tab="active" sessionActive={session.state === 'active'} />

        {/* Session bar — Start / Pause+Finish / Resume+Finish */}
        <SessionBar session={session} units={units}
                    onStart={startSession}
                    onPause={pauseSession}
                    onResume={resumeSession}
                    onFinish={() => setConfirmFinish(true)} />

        <TopBar sub={`${T('common.round')} ${String(round).padStart(2,'0')} / ${String(program.rounds).padStart(2,'0')} · ${T('common.day').toUpperCase()} ${day.id}`}
                title={T(day.labelKey)} />

        {/* Mission brief — KV strip */}
        <div style={{ padding: '4px 16px 16px' }}>
          <Card padding={14}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <KV label={T('today.exercises')} value={exercises.length} />
              <KV label={T('today.sets')} value={`${doneSets}/${totalSets}`} color={doneSets === totalSets ? t.success : t.fg} />
              <KV label={T('today.volume')} value={(doneVolume / 1000).toFixed(1)} unit={units === 'lb' ? 'klb' : 't'} />
              <KV label={T('today.est')} value={estimateMinutes(exercises, run, restOn, defaultRestSec)} unit={T('common.min')} />
            </div>
            <div style={{ height: 4, background: t.surface2, borderRadius: 4, marginTop: 14, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%`,
                background: doneSets === totalSets ? t.success : t.accent,
                transition: 'width 280ms cubic-bezier(.3,.7,.4,1)',
              }} />
            </div>
            {/* Rest toggle + default-rest stepper */}
            <div style={{
              marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.line}`,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <button onClick={() => setRestOn(!restOn)} style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: 0, background: 'transparent', border: 0,
                cursor: 'pointer', color: 'inherit', textAlign: 'left',
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: restOn ? t.fg : 'transparent',
                  border: `1px solid ${restOn ? t.fg : t.lineStrong}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'background 120ms',
                }}>
                  {restOn && <Icon name="check" size={13} stroke={3} color={t.bg} />}
                </span>
                <span style={{
                  fontFamily: t.ui, fontSize: 12, fontWeight: 500, color: t.fg,
                }}>{T('today.includeRest')}</span>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: t.mono, fontSize: 10, color: t.fgDim,
                  letterSpacing: 0.4, textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums',
                }}>{restOn ? 'ON' : 'OFF'}</span>
              </button>
              {/* Default rest — separate min + sec steppers (no carry) */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                opacity: restOn ? 1 : 0.5,
              }}>
                <span style={{
                  flex: 1, fontFamily: t.ui, fontSize: 12, fontWeight: 500, color: t.fgMute,
                  paddingTop: 10,
                }}>{T('today.defaultRest')}</span>
                <div style={{ width: 82, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <SetStepper value={Math.floor(defaultRestSec / 60)}
                              step={1} min={0} max={15}
                              onChange={(m) => setDefaultRestSec(m * 60 + (defaultRestSec % 60))}
                              color={t.fg} />
                  <span style={{
                    fontFamily: t.mono, fontSize: 8, color: t.fgDim,
                    letterSpacing: 1.2, textTransform: 'uppercase',
                  }}>min</span>
                </div>
                <div style={{ width: 82, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <SetStepper value={defaultRestSec % 60}
                              step={15} min={0} max={45}
                              onChange={(s) => setDefaultRestSec(Math.floor(defaultRestSec / 60) * 60 + s)}
                              color={t.fg} />
                  <span style={{
                    fontFamily: t.mono, fontSize: 8, color: t.fgDim,
                    letterSpacing: 1.2, textTransform: 'uppercase',
                  }}>sec</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Exercises — drag to reorder, × to remove, "+ Add" at end */}
        <Section eyebrow={T('today.mission')} title={T('today.exercises')}
                 action={dayOverridden
                   ? <Btn variant="quiet" size="sm" onClick={onRestoreDefault}>{T('today.restoreDefault')}</Btn>
                   : null}
                 style={{ padding: '0 16px' }}>
          {/* Modified badge — small inline strip below the section title */}
          {dayOverridden && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: t.mono, fontSize: 9, color: t.signal,
              letterSpacing: 1.2, textTransform: 'uppercase',
              marginTop: 2, marginBottom: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 6, background: t.signal }} />
              {T('today.dayModified')}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {exercises.map((e, idx) => {
              const isDragging = reorder.drag?.id === e.id;
              const dy = isDragging ? (reorder.drag.fingerY - reorder.drag.startFingerY) : 0;
              return (
                <div key={e.id} ref={reorder.setRef(e.id)} style={{
                  transform: isDragging ? `translateY(${dy}px) scale(1.015)` : 'none',
                  zIndex: isDragging ? 20 : 'auto',
                  position: 'relative',
                  transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(.3,.7,.4,1)',
                  filter: isDragging ? 'drop-shadow(0 14px 28px rgba(0,0,0,0.45))' : 'none',
                  opacity: isDragging ? 0.98 : 1,
                  willChange: isDragging ? 'transform' : 'auto',
                }}>
                  <ExerciseCard ex={e} group={findGroup(e.group)}
                                units={units} round={round} program={program} density={density}
                                restOn={restOn} defaultRestSec={defaultRestSec}
                                doneArr={getDoneArr(e.id)}
                                setDoneArr={(arr) => setDoneArr(e.id, arr)}
                                actuals={getActuals(e.id)}
                                onActuals={(patch) => setActuals(e.id, patch)}
                                onSetActuals={(i, patch) => setSetActuals(e.id, i, patch)}
                                expanded={expanded === e.id}
                                onToggle={() => setExpanded(expanded === e.id ? null : e.id)}
                                dragHandleProps={reorder.getHandleProps(e.id)}
                                dragging={isDragging}
                                onRemove={() => {
                                  if (expanded === e.id) setExpanded(null);
                                  onRemoveExercise && onRemoveExercise(idx);
                                }} />
                </div>
              );
            })}

            {/* Add-exercise — full-width dashed at the end of the list */}
            <button onClick={() => setPickerOpen(true)} style={{
              width: '100%', minHeight: 52, marginTop: 2,
              borderRadius: t.density.cardR,
              background: 'transparent', border: `1px dashed ${t.lineStrong}`,
              color: t.fgMute, cursor: 'pointer',
              fontFamily: t.ui, fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Icon name="plus" size={16} stroke={2} color={t.fgMute} />
              {T('today.addExercise')}
            </button>
          </div>
        </Section>
      </div>

      {/* Picker bottom sheet */}
      {pickerOpen && (
        <ExercisePicker currentIds={exerciseIds}
                        onClose={() => setPickerOpen(false)}
                        onPick={(exId) => {
                          onAddExercise && onAddExercise(exId);
                          setPickerOpen(false);
                        }} />
      )}

      {/* Confirm-finish dialog */}
      {confirmFinish && (
        <ConfirmDialog
          title={T('session.confirmFinish.title')}
          body={T('session.confirmFinish.body')}
          okLabel={T('session.confirmFinish.ok')}
          cancelLabel={T('session.confirmFinish.cancel')}
          onCancel={() => setConfirmFinish(false)}
          onOk={() => { setConfirmFinish(false); finishSession(); }} />
      )}
    </div>
  );
};

Object.assign(window, { ScreenToday });
