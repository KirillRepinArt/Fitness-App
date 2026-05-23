// screen-today.jsx — Active tab: session timer + per-exercise logging with
// inline < > steppers for weight, reps, sets. Designed for use mid-workout:
// big touch targets, glanceable timer, one-tap completion.

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

// ─── Confirm-finish modal ───────────────────────────────────────────────────
const ConfirmDialog = ({ title, body, okLabel, cancelLabel, onOk, onCancel }) => {
  const t = useTheme();
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
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
          <Btn variant="accent" size="md" style={{ flex: 1 }} onClick={onOk}>{okLabel}</Btn>
        </div>
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
                        expanded, onToggle }) => {
  const t = useTheme();
  const T = useT();

  // Plan (projected) vs actual (logged overrides)
  const projected = projectedKg(ex, group, round, program);
  const plannedKgSnap = snapForUnits(projected, group, ex.equip, 'kg');
  const plannedWeight = Number(fmtWeight(plannedKgSnap, units));
  const plannedReps = ex.reps;
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
      {/* Header — tap to expand */}
      <div onClick={onToggle} style={{
        padding: `${density === 'compact' ? 12 : 16}px ${density === 'compact' ? 14 : 16}px`,
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

// ─── Active screen ──────────────────────────────────────────────────────────
const ScreenToday = ({ units, program, run, density,
                       onLog, startSession, pauseSession, resumeSession, finishSession,
                       setActuals, setSetActuals }) => {
  const t = useTheme();
  const T = useT();
  const [expanded, setExpanded] = React.useState(null);
  const [confirmFinish, setConfirmFinish] = React.useState(false);
  const [restOn, setRestOn] = React.useState(true);
  const [defaultRestSec, setDefaultRestSec] = React.useState(180);

  const log = run.log || {};
  const round = run.currentRound;
  const dayIdx = run.currentDayIdx;
  const day = program.days[dayIdx];
  const session = run.session || { state: 'idle' };

  const exercises = day.exercises.map((id) => exerciseInRun(id, run)).filter(Boolean);
  const isRecoveryRound = round % program.recovery.every === 0;

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
      const reps = perSet[i]?.reps ?? e.reps;
      vol += w * reps;
    }
    return s + vol;
  }, 0);

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 110, position: 'relative' }}>
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

      {/* Exercises */}
      <Section eyebrow={T('today.mission')} title={T('today.exercises')}
               action={<Btn variant="quiet" size="sm" icon="plus">{T('common.add')}</Btn>}
               style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {exercises.map((e) => (
            <ExerciseCard key={e.id} ex={e} group={findGroup(e.group)}
                          units={units} round={round} program={program} density={density}
                          restOn={restOn} defaultRestSec={defaultRestSec}
                          doneArr={getDoneArr(e.id)}
                          setDoneArr={(arr) => setDoneArr(e.id, arr)}
                          actuals={getActuals(e.id)}
                          onActuals={(patch) => setActuals(e.id, patch)}
                          onSetActuals={(idx, patch) => setSetActuals(e.id, idx, patch)}
                          expanded={expanded === e.id}
                          onToggle={() => setExpanded(expanded === e.id ? null : e.id)} />
          ))}
        </div>
      </Section>

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
