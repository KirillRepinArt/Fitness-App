// screen-catalogue.jsx — programs catalogue + detail view.
// List of built-in presets + your custom programs. Tap into one to view
// structure and adopt it (start a new run).

const ProgramRow = ({ program, isActive, pastRunCount = 0, onTap, density }) => {
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
            {isActive && <Pill tone="accent">{T('cat.deployed')}</Pill>}
            {pastRunCount > 0 && <Pill tone="mute">× {pastRunCount} {T('cat.runsCount')}</Pill>}
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

// Past run row — used in the detail's history section.
const PastRunRow = ({ run, units }) => {
  const t = useTheme();
  const T = useT();
  const tone = run.status === 'complete' ? t.success
            : run.status === 'cancelled' ? t.fgDim
            : t.accent;
  const glyph = run.status === 'complete' ? '✓'
             : run.status === 'cancelled' ? '×'
             : '●';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: t.surface2, border: `1px solid ${t.line}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: t.surface, border: `1px solid ${t.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: tone, fontFamily: t.mono, fontSize: 13, fontWeight: 700,
      }}>{glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: t.ui, fontSize: 13, fontWeight: 600, color: t.fg,
        }}>{T('cat.runOf').replace('{n}', run.runIndex)}</div>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginTop: 2, letterSpacing: 0.2,
        }}>
          {fmtDate(new Date(run.startedOn).getTime(), units)}
          {run.endedOn && ` → ${fmtDate(new Date(run.endedOn).getTime(), units)}`}
        </div>
      </div>
      {run.peakWeights?.bench !== undefined && (
        <div style={{
          fontFamily: t.mono, fontSize: 11, color: t.fgMute, fontVariantNumeric: 'tabular-nums',
        }}>
          {T('common.peak')} {fmtWeight(run.peakWeights.bench, units)} {unitLabel(units)}
        </div>
      )}
    </div>
  );
};

// Detail view — opens as a full overlay panel within the tab.
const ProgramDetail = ({ program, activeRun, runs, onClose, onAdopt, onOpenStats, units, density }) => {
  const t = useTheme();
  const T = useT();
  const isActive = activeRun?.programId === program.id;

  // Run history for this program.
  const programRuns = runsForProgram(program.id, runs);
  const pastRuns = programRuns.filter((r) => r.status !== 'active');
  const nextIdx = nextRunIndex(program.id, runs);
  const lastWithPeak = programRuns.filter((r) => r.peakWeights && Object.keys(r.peakWeights).length).slice(-1)[0];

  // Suggested overload bump (intermediate default).
  const [bump, setBump] = React.useState(2.5);
  const [confirmDeploy, setConfirmDeploy] = React.useState(false);

  // Stats button — for now only useful if this is the active program (Stats
  // tab shows the active run). Otherwise we surface it disabled with a hint.
  const statsAvailable = isActive;

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {isActive && <Pill tone="accent">{T('cat.deployed')}</Pill>}
          <Pill tone={isActive ? 'mute' : 'mute'}>{T(program.tagKey)}</Pill>
        </div>
      </div>

      {/* Scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 120 }}>

        {/* Blurb */}
        <div style={{ padding: '14px 16px 6px', fontFamily: t.ui, fontSize: 13, color: t.fgMute, lineHeight: 1.5 }}>
          {T(program.blurbKey)}
        </div>

        {/* Vitals */}
        <div style={{ padding: '6px 16px 6px' }}>
          <Card padding={14}>
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
        </div>

        {/* Mesocycle preview — full program shape; current-day highlight only
            when THIS program is currently deployed.  Use a tab key keyed on the
            program id so each program remembers its own open/closed state. */}
        <MesoPreview key={program.id} program={program} run={isActive ? activeRun : null}
                     units={units} tab={`catalogue:${program.id}`} sessionActive={false} />

        {/* Past runs */}
        {pastRuns.length > 0 && (
          <Section eyebrow={T('cat.runs')} title={`${pastRuns.length} ${T('cat.runsCount')}`}
                   style={{ padding: '6px 16px 8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              {pastRuns.slice().reverse().map((r) => (
                <PastRunRow key={r.id} run={r} units={units} />
              ))}
            </div>
          </Section>
        )}

        {/* Stats + Edit actions */}
        <div style={{ padding: '8px 16px 14px', display: 'flex', gap: 8 }}>
          <Btn variant="quiet" size="md" icon="stats" style={{ flex: 1 }}
               disabled={!statsAvailable}
               onClick={() => statsAvailable && onOpenStats && onOpenStats(program.id)}>
            {T('cat.stats')}
          </Btn>
          <Btn variant="quiet" size="md" icon="edit" style={{ flex: 1 }}
               disabled
               onClick={() => {}}>
            {T('common.edit')}
          </Btn>
        </div>
        {program.builtin && (
          <div style={{
            padding: '0 16px 14px',
            fontFamily: t.mono, fontSize: 10, color: t.fgDim, lineHeight: 1.5,
            letterSpacing: 0.2,
          }}>
            ◇ {T('cat.readOnlyNote')}
          </div>
        )}

        {/* Overload bump preset (only if we have past peaks to bump from) */}
        {lastWithPeak && (
          <div style={{ padding: '0 16px 14px' }}>
            <Card padding={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Icon name="arrowUp" size={16} color={t.signal} />
                <div style={{ flex: 1, fontFamily: t.ui, fontSize: 13, fontWeight: 600, color: t.fg }}>
                  {T('cat.lastRun')}
                </div>
                <Pill tone="signal">+{bump} kg</Pill>
              </div>
              <div style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginBottom: 10, lineHeight: 1.5 }}>
                {T('common.peak')} {fmtWeight(lastWithPeak.peakWeights.bench || 0, units)} {unitLabel(units)} · {T('common.next')} = +{bump}{units === 'lb' ? 'lb' : ' kg'}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>{T('common.step')}</span>
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
          </div>
        )}
      </div>

      {/* Sticky action bar — Deploy with auto-versioned next index */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: 14, background: `linear-gradient(to top, ${t.bg} 60%, transparent)`,
        display: 'flex', gap: 10,
      }}>
        <Btn variant="accent" size="lg" style={{ flex: 1 }}
             onClick={() => setConfirmDeploy(true)}>
          <Icon name="play" size={16} />
          {T('cat.deploy')} · #{nextIdx}
        </Btn>
      </div>

      {/* Deploy confirm */}
      {confirmDeploy && (
        <ConfirmDialog
          title={T('cat.deployConfirm.title')}
          body={(activeRun ? T('cat.deployConfirm.body') : T('cat.deployConfirm.bodyNoActive'))
                  .replace('{name}', T(program.nameKey))
                  .replace('{n}', String(nextIdx))}
          okLabel={T('cat.deployConfirm.ok')}
          cancelLabel={T('cat.deployConfirm.cancel')}
          onCancel={() => setConfirmDeploy(false)}
          onOk={() => { setConfirmDeploy(false); onAdopt(program, bump); }}
        />
      )}
    </div>
  );
};

// Main catalogue list screen.
const ScreenCatalogue = ({ programs, runs, activeRunId, onAdopt, onOpenStats, units, density }) => {
  const t = useTheme();
  const T = useT();
  const [selected, setSelected] = React.useState(null);
  const activeRun = runs.find((r) => r.id === activeRunId) || null;
  const builtin = programs.filter((p) => p.builtin);
  const custom = programs.filter((p) => !p.builtin);

  // Past run count for backlinks (excludes the currently-active one).
  const pastRunCount = (programId) =>
    runsForProgram(programId, runs).filter((r) => r.status !== 'active').length;

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

        {/* Default — built-in templates */}
        <Section eyebrow={T('cat.builtin')} title={T('cat.builtinTitle')} style={{ padding: '6px 16px 14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {builtin.map((p) => (
              <ProgramRow key={p.id} program={p}
                          isActive={activeRun?.programId === p.id}
                          pastRunCount={pastRunCount(p.id)}
                          onTap={() => setSelected(p)} density={density} />
            ))}
          </div>
        </Section>

        {/* My Programs — custom + forked */}
        <Section eyebrow={T('cat.custom')} title={T('cat.customTitle')} style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {custom.map((p) => (
              <ProgramRow key={p.id} program={p}
                          isActive={activeRun?.programId === p.id}
                          pastRunCount={pastRunCount(p.id)}
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
        <ProgramDetail program={selected} activeRun={activeRun} runs={runs}
                       onClose={() => setSelected(null)}
                       onAdopt={(p, bump) => { onAdopt(p, bump); setSelected(null); }}
                       onOpenStats={(programId) => { onOpenStats && onOpenStats(programId); setSelected(null); }}
                       units={units} density={density} />
      )}
    </div>
  );
};

Object.assign(window, { ScreenCatalogue });
