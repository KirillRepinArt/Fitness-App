// screen-catalogue.jsx — programs catalogue + detail view.
// List of built-in presets + your custom programs. Tap into one to view
// structure and adopt it (start a new run).

const ProgramRow = ({ program, isActive, onTap, density }) => {
  const t = useTheme();
  const T = useT();
  return (
    <Card onClick={onTap} padding={density === 'compact' ? 12 : 14}
          accent={isActive ? t.accent : undefined}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: t.ui, fontWeight: 600, fontSize: 14, color: t.fg, letterSpacing: -0.1 }}>
              {T(program.nameKey)}
            </span>
            {isActive && <Pill tone="accent">{T('cat.alreadyActive')}</Pill>}
            <Pill tone="mute">{T(program.tagKey)}</Pill>
          </div>
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.fgMute, marginTop: 2, letterSpacing: 0.2 }}>
            {T(program.authorKey)} · {T(program.yearKey)}
          </div>
          <div style={{ fontFamily: t.ui, fontSize: 12, color: t.fgMute, marginTop: 6, lineHeight: 1.4 }}>
            {T(program.blurbKey)}
          </div>
        </div>
      </div>
      <div style={{
        display: 'flex', gap: 10, marginTop: 10, paddingTop: 10,
        borderTop: `1px solid ${t.line}`,
      }}>
        <KV label={T('cat.length')} value={program.rounds} unit="wks" />
        <KV label={T('cat.frequency')} value={`${program.workoutDaysPerRound}×/wk`} />
        <KV label={T('common.deload')} value={`R${program.recovery.every}`} color={t.signal} />
        <div style={{ flex: 1 }} />
        <Icon name="chev" size={16} color={t.fgDim} />
      </div>
    </Card>
  );
};

// Detail view — opens as a full overlay panel within the tab.
const ProgramDetail = ({ program, activeRun, onClose, onAdopt, units, density, hasPastRun, pastRun }) => {
  const t = useTheme();
  const T = useT();
  const isActive = activeRun?.programId === program.id;

  // Suggested overload bump (intermediate default).
  const [bump, setBump] = React.useState(2.5);
  const lastPeak = pastRun?.peakWeights?.bench ?? null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30, background: t.bg,
      display: 'flex', flexDirection: 'column',
      animation: 'detailIn 200ms cubic-bezier(.3,.7,.4,1)',
    }}>
      <style>{`@keyframes detailIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{
        padding: '14px 16px 12px', borderBottom: `1px solid ${t.line}`,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: 8, background: t.surface2,
          border: `1px solid ${t.line}`, color: t.fg, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="x" size={16} stroke={2} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 1.4, textTransform: 'uppercase' }}>
            {T(program.authorKey)} · {T(program.yearKey)}
          </div>
          <div style={{ fontFamily: t.ui, fontSize: 22, fontWeight: t.displayWeight, color: t.fg, letterSpacing: -0.3, marginTop: 2 }}>
            {T(program.nameKey)}
          </div>
        </div>
        <Pill tone={isActive ? 'accent' : 'mute'}>{T(program.tagKey)}</Pill>
      </div>

      {/* Scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 120px' }}>

        {/* Blurb */}
        <div style={{ fontFamily: t.ui, fontSize: 13, color: t.fgMute, lineHeight: 1.5, marginBottom: 14 }}>
          {T(program.blurbKey)}
        </div>

        {/* Vitals */}
        <Card padding={14} style={{ marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <KV label={T('cat.length')} value={program.rounds} unit="wks" />
            <KV label={T('cat.frequency')} value={`${program.workoutDaysPerRound}×/wk`} />
            <KV label={T('program.daysPer')} value={program.roundDays} unit="d" />
            <KV label={T('common.deload')} value={`R${program.recovery.every}`} color={t.signal} />
          </div>
          {Object.keys(program.formulaOverrides).length > 0 && (
            <div style={{
              marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.line}`,
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              {Object.entries(program.formulaOverrides).map(([gid, f]) => (
                <Pill key={gid} tone="signal">
                  {gid.toUpperCase()} · {formulaText(f, units)}
                </Pill>
              ))}
            </div>
          )}
        </Card>

        {/* Structure */}
        <Section eyebrow={T('cat.structure')} title={T('program.workoutDays')}
                 style={{ padding: '0', marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            {program.days.map((d) => {
              const exs = d.exercises.map((id) => findExercise(id)).filter(Boolean);
              return (
                <Card key={d.id} padding={12}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: t.surface2,
                      border: `1px solid ${t.line}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: t.mono, fontSize: 12, fontWeight: 700, color: t.fg,
                    }}>{d.id}</div>
                    <span style={{ flex: 1, fontFamily: t.ui, fontSize: 13, fontWeight: 600, color: t.fg }}>{T(d.labelKey)}</span>
                    <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, letterSpacing: 0.4 }}>{exs.length} EX</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {exs.map((e) => (
                      <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <GroupDot id={e.group} />
                        <span style={{ flex: 1, fontFamily: t.ui, fontSize: 12, color: t.fgMute }}>{T(e.nameKey)}</span>
                        <span style={{ fontFamily: t.mono, fontSize: 11, color: t.fgDim, fontVariantNumeric: 'tabular-nums' }}>
                          {e.sets}×{e.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* Past run / overload bump */}
        {hasPastRun && (
          <Card padding={14} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Icon name="arrowUp" size={16} color={t.signal} />
              <div style={{ flex: 1, fontFamily: t.ui, fontSize: 13, fontWeight: 600, color: t.fg }}>
                {T('cat.lastRun')}
              </div>
              <Pill tone="signal">+{bump} kg</Pill>
            </div>
            <div style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginBottom: 10, lineHeight: 1.5 }}>
              Previous peak bench {lastPeak} kg · new start = previous start + overload increment.
              <br/>The wave begins below the previous peak, by design.
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>Bump</span>
              {[1.25, 2.5, 5].map((b) => (
                <button key={b} onClick={() => setBump(b)} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: bump === b ? t.fg : t.surface2,
                  color: bump === b ? t.bg : t.fg,
                  border: 0, cursor: 'pointer',
                  fontFamily: t.mono, fontSize: 11, fontWeight: 600,
                }}>+{b} kg</button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Sticky action bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: 14, background: `linear-gradient(to top, ${t.bg} 60%, transparent)`,
        display: 'flex', gap: 10,
      }}>
        {isActive ? (
          <Btn variant="quiet" size="lg" style={{ flex: 1 }} onClick={onClose}>
            <Icon name="check" size={16} stroke={2.5} />
            {T('cat.alreadyActive')}
          </Btn>
        ) : (
          <Btn variant="accent" size="lg" style={{ flex: 1 }} onClick={() => onAdopt(program, bump)}>
            <Icon name="play" size={16} />
            {activeRun ? T('cat.adopt') : T('cat.start')}
          </Btn>
        )}
      </div>
    </div>
  );
};

// Main catalogue list screen.
const ScreenCatalogue = ({ programs, runs, activeRunId, onAdopt, units, density }) => {
  const t = useTheme();
  const T = useT();
  const [selected, setSelected] = React.useState(null);
  const activeRun = runs.find((r) => r.id === activeRunId) || null;
  const builtin = programs.filter((p) => p.builtin);
  const custom = programs.filter((p) => !p.builtin);

  // For the picked program, look up a past completed run (if any).
  const pastRunFor = (programId) => {
    return runs.filter((r) => r.programId === programId && r.status === 'complete').slice(-1)[0];
  };
  const pastForSelected = selected ? pastRunFor(selected.id) : null;

  return (
    <div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 110 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brand size={14} />
            <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, letterSpacing: 1.4, textTransform: 'uppercase' }}>{T('tab.catalogue')}</span>
          </div>
          <Btn variant="quiet" size="sm" icon="plus">{T('cat.new')}</Btn>
        </div>

        <TopBar sub={T('cat.sub')} title={T('cat.title')} />

        {/* Built-in */}
        <Section eyebrow={T('cat.builtin')} title={T('cat.builtinTitle')} style={{ padding: '6px 16px 14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {builtin.map((p) => (
              <ProgramRow key={p.id} program={p}
                          isActive={activeRun?.programId === p.id}
                          onTap={() => setSelected(p)} density={density} />
            ))}
          </div>
        </Section>

        {/* Custom */}
        <Section eyebrow={T('cat.custom')} title={T('cat.custom')} style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {custom.map((p) => (
              <ProgramRow key={p.id} program={p}
                          isActive={activeRun?.programId === p.id}
                          onTap={() => setSelected(p)} density={density} />
            ))}
            {/* Empty add card */}
            <div style={{
              padding: 14, borderRadius: 14, border: `1px dashed ${t.lineStrong}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icon name="goal" size={18} color={t.signal} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.ui, fontSize: 13, fontWeight: 600, color: t.fg }}>{T('cat.goal')}</div>
                <div style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginTop: 2 }}>Tell me your bench target; I'll write the program.</div>
              </div>
              <Btn variant="ghost" size="sm">→</Btn>
            </div>
          </div>
        </Section>
      </div>

      {selected && (
        <ProgramDetail program={selected} activeRun={activeRun}
                       onClose={() => setSelected(null)}
                       onAdopt={(p, bump) => { onAdopt(p, bump); setSelected(null); }}
                       units={units} density={density}
                       hasPastRun={!!pastForSelected}
                       pastRun={pastForSelected} />
      )}
    </div>
  );
};

Object.assign(window, { ScreenCatalogue });
