// meso-preview.jsx — Mesocycle calendar preview.
// Used on Active (with current-day highlight + done indicators) and on
// Catalogue (read-only preview). Two display states — collapsed strip
// (one-line summary) and expanded calendar. User preference persists to
// localStorage per-tab; on Active, an active session timer force-collapses.

// ─── Persistence hook ───────────────────────────────────────────────────────
// userOpen: user's saved preference. effective: what we actually render —
// force-collapsed wins. Toggling while forced doesn't write to localStorage.
function useMesoOpen(tab, forceCollapsed) {
  const key = `meso:open:${tab}`;
  const [userOpen, setUserOpen] = React.useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? true : stored === 'true';
    } catch (_) { return true; }
  });
  const setOpen = (v) => {
    setUserOpen(v);
    try { localStorage.setItem(key, String(v)); } catch (_) {}
  };
  const effective = forceCollapsed ? false : userOpen;
  return [effective, setOpen, forceCollapsed];
}

// ─── Day cell ───────────────────────────────────────────────────────────────
// Workout: shows the day-template letter (A/B/C/D). Rest: dashed dot.
// Visual states layered: deload tint < done tint < current accent < selected ring.
const DayCell = ({ day, isCurrent, isDone, isDeload, selected, size, onClick }) => {
  const t = useTheme();
  if (!day) {
    return (
      <div style={{
        width: size, height: size,
        borderRadius: 6,
        background: 'transparent',
        border: `1px dashed ${t.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.fgDim, fontFamily: t.mono, fontSize: 9,
      }}>·</div>
    );
  }
  let bg = t.surface2;
  let borderColor = t.line;
  let color = t.fgMute;
  if (isDeload) { bg = `${t.signal}11`; borderColor = `${t.signal}55`; color = t.signal; }
  if (isDone)   { bg = `${t.success}22`; borderColor = t.success; color = t.success; }
  if (isCurrent){ bg = t.accent; borderColor = t.accent; color = '#fff'; }
  const ring = selected ? `0 0 0 2px ${t.fg}` : 'none';
  return (
    <button onClick={onClick} aria-label={`Day ${day.id}`}
            style={{
              width: size, height: size,
              borderRadius: 6,
              background: bg, border: `1px solid ${borderColor}`,
              color, cursor: 'pointer', padding: 0,
              fontFamily: t.mono, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', boxShadow: ring,
              transition: 'box-shadow 120ms',
            }}>
      {day.id}
      {isDone && !isCurrent && (
        <span style={{
          position: 'absolute', top: -3, right: -3,
          width: 7, height: 7, borderRadius: 7,
          background: t.success, border: `1.5px solid ${t.bg}`,
        }} />
      )}
    </button>
  );
};

// ─── Round row — label + N day cells ────────────────────────────────────────
const RoundRow = ({ program, round, run, selected, onSelect, cellSize }) => {
  const t = useTheme();
  const isDeloadRound = round % program.recovery.every === 0;
  const isCurrentRound = run?.currentRound === round;
  const slots = workoutSlotsForRound(program);
  const slotsByDay = {};
  for (const s of slots) {
    slotsByDay[s.dayOfRound] = { day: program.days[s.dayTemplateIdx], dayTemplateIdx: s.dayTemplateIdx };
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 0',
    }}>
      <div style={{
        width: 32, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      }}>
        <div style={{
          fontFamily: t.mono, fontSize: 9,
          color: isCurrentRound ? t.fg : t.fgDim,
          fontWeight: isCurrentRound ? 700 : 500,
          letterSpacing: 0.6, fontVariantNumeric: 'tabular-nums',
        }}>R{String(round).padStart(2,'0')}</div>
        {isDeloadRound && (
          <div style={{
            fontFamily: t.mono, fontSize: 7, color: t.signal,
            letterSpacing: 1.4, marginTop: 1, fontWeight: 700,
          }}>DL</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'flex-start' }}>
        {Array.from({ length: program.roundDays }).map((_, dayOfRound) => {
          const info = slotsByDay[dayOfRound];
          const day = info?.day;
          const dayTemplateIdx = info?.dayTemplateIdx;
          const isCurrent = isCurrentRound && day && dayTemplateIdx === run.currentDayIdx;
          const isDone = run?.sessions?.some((s) => s.round === round && s.dayIdx === dayTemplateIdx);
          const selectedHere = selected?.round === round && selected?.dayOfRound === dayOfRound;
          return (
            <DayCell key={dayOfRound}
                     day={day}
                     isCurrent={!!isCurrent}
                     isDone={!!isDone}
                     isDeload={isDeloadRound}
                     selected={!!selectedHere}
                     size={cellSize}
                     onClick={day ? () => onSelect({ round, dayOfRound, dayTemplateIdx }) : undefined} />
          );
        })}
      </div>
    </div>
  );
};

// ─── Selected day panel ─────────────────────────────────────────────────────
// Read-only preview of the day's exercises with a suggested date based on
// run.startedOn (program-relative — assumes one calendar day per program day).
const SelectedDayPanel = ({ program, selected, run, units }) => {
  const t = useTheme();
  const T = useT();
  const day = program.days[selected.dayTemplateIdx];
  if (!day) return null;
  const isDone = run?.sessions?.some((s) => s.round === selected.round && s.dayIdx === selected.dayTemplateIdx);
  const isCurrent = run?.currentRound === selected.round && run?.currentDayIdx === selected.dayTemplateIdx;
  const isDeload = selected.round % program.recovery.every === 0;
  const programDay = (selected.round - 1) * program.roundDays + selected.dayOfRound + 1;

  // For the CURRENT cell, show the effective (overridden) exercise list so
  // the preview matches what the user sees in the main pane. All other cells
  // show the program's template (since overrides are scoped to current day).
  const overrideIds = run?.dayOverrides?.[selected.dayTemplateIdx];
  const useOverride = isCurrent && Array.isArray(overrideIds);
  const exerciseIds = useOverride ? overrideIds : day.exercises;

  // Suggested calendar date: startedOn + (programDay - 1) days.
  let suggestedTs = null;
  if (run?.startedOn) {
    const startMs = new Date(run.startedOn).getTime();
    suggestedTs = startMs + (programDay - 1) * 86400000;
  }

  return (
    <div style={{
      marginTop: 10, padding: 12, borderRadius: 12,
      background: t.surface2, border: `1px solid ${t.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: isCurrent ? t.accent : isDone ? `${t.success}22` : t.surface,
          border: `1px solid ${isCurrent ? t.accent : isDone ? t.success : t.line}`,
          color: isCurrent ? '#fff' : isDone ? t.success : t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.mono, fontSize: 13, fontWeight: 700,
        }}>{day.id}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: t.ui, fontWeight: 600, fontSize: 14, color: t.fg, letterSpacing: -0.1,
            }}>{T(day.labelKey)}</span>
            {isCurrent && <Pill tone="accent">{T('common.now')}</Pill>}
            {isDone && !isCurrent && <Pill tone="mute">✓</Pill>}
            {isDeload && <Pill tone="signal">{T('common.deloadCaps')}</Pill>}
          </div>
          <div style={{
            display: 'flex', gap: 10, marginTop: 4,
            fontFamily: t.mono, fontSize: 10, color: t.fgDim, letterSpacing: 0.3,
            flexWrap: 'wrap',
          }}>
            <span>R{String(selected.round).padStart(2,'0')}/{String(program.rounds).padStart(2,'0')}</span>
            <span>·</span>
            <span>{T('meso.programDay').replace('{n}', programDay)}</span>
            {suggestedTs && (
              <>
                <span>·</span>
                <span style={{ color: t.fgMute }}>{T('meso.suggested')} {fmtDate(suggestedTs, units)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Exercises preview (read-only) */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 2,
        paddingTop: 8, borderTop: `1px solid ${t.line}`,
      }}>
        {exerciseIds.map((id, idx) => {
          const ex = findExercise(id);
          if (!ex) return null;
          return (
            <div key={`${id}-${idx}`} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 0',
            }}>
              <span style={{
                fontFamily: t.mono, fontSize: 9, color: t.fgDim, width: 16,
                fontVariantNumeric: 'tabular-nums',
              }}>{String(idx+1).padStart(2,'0')}</span>
              <GroupDot id={ex.group} size={6} />
              <span style={{
                flex: 1, fontFamily: t.ui, fontSize: 12, color: t.fgMute, letterSpacing: -0.05,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{T(ex.nameKey)}</span>
              <span style={{
                fontFamily: t.mono, fontSize: 10, color: t.fgDim,
                fontVariantNumeric: 'tabular-nums',
              }}>{ex.sets}×{ex.reps}</span>
            </div>
          );
        })}
        {exerciseIds.length === 0 && (
          <div style={{
            fontFamily: t.mono, fontSize: 10, color: t.fgDim,
            padding: '8px 0', textAlign: 'center',
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>—</div>
        )}
      </div>
    </div>
  );
};

// ─── Collapsed strip ────────────────────────────────────────────────────────
// One-line summary: label · position · progress bar · day#/total · chevron.
// When `locked` (timer running), tapping does nothing — strip just informs.
const CollapsedStrip = ({ program, run, onExpand, locked }) => {
  const t = useTheme();
  const T = useT();
  const round = run?.currentRound || 1;
  const dayIdx = run?.currentDayIdx || 0;
  const day = program.days[dayIdx];
  const totalDays = program.rounds * program.roundDays;
  const slots = workoutSlotsForRound(program);
  const currentSlot = slots.find((s) => s.dayTemplateIdx === dayIdx);
  const programDay = (round - 1) * program.roundDays + (currentSlot?.dayOfRound ?? 0) + 1;
  const pct = (programDay / totalDays) * 100;
  return (
    <button onClick={locked ? undefined : onExpand}
            aria-label={T('meso.expand')}
            style={{
              width: '100%',
              background: t.surface, border: `1px solid ${t.line}`,
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: locked ? 'default' : 'pointer',
              color: 'inherit', fontFamily: 'inherit',
              opacity: locked ? 0.85 : 1,
            }}>
      <div style={{
        fontFamily: t.mono, fontSize: 9, color: t.fgDim,
        letterSpacing: 1.2, textTransform: 'uppercase',
      }}>{T('meso.label')}</div>
      <div style={{
        fontFamily: t.mono, fontSize: 10, color: t.fg,
        fontVariantNumeric: 'tabular-nums', fontWeight: 700, letterSpacing: 0.4,
      }}>R{String(round).padStart(2,'0')}·{day?.id || '—'}</div>
      <div style={{ flex: 1, height: 4, background: t.surface2, borderRadius: 4, overflow: 'hidden', minWidth: 30 }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: t.accent,
          transition: 'width 280ms ease-out',
        }} />
      </div>
      <div style={{
        fontFamily: t.mono, fontSize: 9, color: t.fgDim,
        fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4,
      }}>{String(programDay).padStart(2,'0')}/{String(totalDays).padStart(2,'0')}</div>
      <Icon name={locked ? 'timer' : 'chevD'} size={12} color={t.fgDim} />
    </button>
  );
};

// ─── Main preview ───────────────────────────────────────────────────────────
const MesoPreview = ({ program, run, units = 'kg', tab = 'active', sessionActive = false }) => {
  const t = useTheme();
  const T = useT();
  const [open, setOpen, forced] = useMesoOpen(tab, sessionActive);
  const [selected, setSelected] = React.useState(() => {
    if (!run) return null;
    const slots = workoutSlotsForRound(program);
    const slot = slots.find((s) => s.dayTemplateIdx === run.currentDayIdx);
    return slot ? { round: run.currentRound, dayOfRound: slot.dayOfRound, dayTemplateIdx: slot.dayTemplateIdx } : null;
  });
  // Re-anchor selection when current day changes (e.g. session finished).
  React.useEffect(() => {
    if (!run) return;
    const slots = workoutSlotsForRound(program);
    const slot = slots.find((s) => s.dayTemplateIdx === run.currentDayIdx);
    if (slot) setSelected({ round: run.currentRound, dayOfRound: slot.dayOfRound, dayTemplateIdx: slot.dayTemplateIdx });
  }, [program.id, run?.currentRound, run?.currentDayIdx]);

  if (!open) {
    return (
      <div style={{ padding: '6px 16px' }}>
        <CollapsedStrip program={program} run={run}
                        onExpand={() => setOpen(true)} locked={forced} />
      </div>
    );
  }

  // Phone shell width ≈ 360px, container padding 16px each side → ~328px usable.
  // Label column ~32 + gap 8 = 40. Cells share remaining ~288px with 4px gaps.
  const innerWidth = 288;
  const gap = 4;
  const cellSize = Math.max(28,
    Math.min(40, Math.floor((innerWidth - gap * (program.roundDays - 1)) / program.roundDays))
  );

  return (
    <div style={{ padding: '6px 16px' }}>
      <Card padding={12}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <div style={{
            fontFamily: t.mono, fontSize: 9, color: t.fgDim,
            letterSpacing: 1.4, textTransform: 'uppercase',
          }}>{T('meso.label')} 1</div>
          <div style={{
            fontFamily: t.ui, fontSize: 13, fontWeight: 600, color: t.fg, letterSpacing: -0.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
          }}>{T(program.nameKey)}</div>
          <div style={{ flex: 1 }} />
          <div style={{
            fontFamily: t.mono, fontSize: 10, color: t.fgMute,
            fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4,
          }}>{program.rounds}×{program.roundDays}d</div>
          <button onClick={() => setOpen(false)}
                  aria-label={T('meso.collapse')}
                  style={{
                    width: 26, height: 26, borderRadius: 6, background: 'transparent',
                    border: `1px solid ${t.line}`, color: t.fgMute, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                 stroke={t.fgMute} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </div>
        {/* Calendar grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {Array.from({ length: program.rounds }).map((_, i) => (
            <RoundRow key={i+1} program={program} round={i+1} run={run}
                      selected={selected} onSelect={setSelected} cellSize={cellSize} />
          ))}
        </div>
        {/* Legend */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.line}`,
          fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 0.6,
        }}>
          <LegendDot color={t.accent} label={T('common.now')} />
          <LegendDot color={t.success} label={T('meso.legend.done')} />
          <LegendDot color={t.signal} label={T('meso.legend.deload')} />
          <LegendDot color="transparent" border={t.line} dashed label={T('meso.legend.rest')} />
        </div>
        {/* Selected day */}
        {selected && (
          <SelectedDayPanel program={program} selected={selected} run={run} units={units} />
        )}
      </Card>
    </div>
  );
};

const LegendDot = ({ color, border, dashed, label }) => {
  const t = useTheme();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: 8, height: 8, borderRadius: 3,
        background: color,
        border: `1px ${dashed ? 'dashed' : 'solid'} ${border || color}`,
      }} />
      <span style={{ textTransform: 'uppercase' }}>{label}</span>
    </span>
  );
};

Object.assign(window, { MesoPreview, useMesoOpen });
