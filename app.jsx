// app.jsx — top-level App: state, theme + lang contexts, screen routing, Tweaks.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cape",
  "typeface": "tactical",
  "density": "comfy",
  "formulaUi": "presets",
  "units": "kg",
  "lang": "ru"
}/*EDITMODE-END*/;

function buildTheme(t) {
  const pal = PALETTES[t.palette] || PALETTES.cape;
  const tp = TYPE_PRESETS[t.typeface] || TYPE_PRESETS.tactical;
  const den = DENSITY[t.density] || DENSITY.comfy;
  return {
    ...pal, ...tp,
    density: den,
    paletteId: t.palette, typeId: t.typeface, densityId: t.density,
  };
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = React.useMemo(() => buildTheme(tweaks), [tweaks]);

  React.useEffect(() => { document.body.style.background = theme.bg; }, [theme.bg]);

  return (
    <ThemeCtx.Provider value={theme}>
      <LangCtx.Provider value={tweaks.lang || 'ru'}>
        <Shell tweaks={tweaks} setTweak={setTweak} theme={theme} />
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}

function Shell({ tweaks, setTweak, theme }) {
  const T = useT();
  const [tab, setTab] = React.useState('active');

  // ── Domain state ──
  const [programs, setPrograms] = React.useState(SEED_PROGRAMS);
  const [runs, setRuns] = React.useState(SEED_RUNS);
  const [activeRunId, setActiveRunId] = React.useState(SEED_RUNS[0]?.id || null);

  const activeRun = runs.find((r) => r.id === activeRunId) || null;
  const activeProgram = activeRun ? programs.find((p) => p.id === activeRun.programId) : null;

  // ── Lifecycle handlers ──
  const updateRun = (id, patch) => {
    setRuns((rs) => rs.map((r) => r.id === id ? (typeof patch === 'function' ? patch(r) : { ...r, ...patch }) : r));
  };
  const onLog = (newLog) => {
    if (activeRunId) updateRun(activeRunId, { log: newLog });
  };
  // Session timer controls — Start / Pause / Resume / Finish.
  const startSession = () => {
    const now = Date.now();
    updateRun(activeRunId, { session: { state: 'active', startedAt: now, firstStartedAt: now, accumMs: 0, pausedAt: null }});
  };
  const pauseSession = () => updateRun(activeRunId, (r) => {
    if (r.session.state !== 'active') return r;
    const now = Date.now();
    const elapsed = (now - (r.session.startedAt || now));
    return { ...r, session: { state: 'paused', startedAt: null, accumMs: r.session.accumMs + elapsed, pausedAt: now }};
  });
  const resumeSession = () => updateRun(activeRunId, (r) => {
    if (r.session.state !== 'paused') return r;
    return { ...r, session: { ...r.session, state: 'active', startedAt: Date.now(), pausedAt: null }};
  });
  // Finish: snapshot the current session log + actuals, advance day index, reset
  // session timer. If we wrap past the last workout of a round, advance round.
  const finishSession = () => updateRun(activeRunId, (r) => {
    const now = Date.now();
    const elapsed = r.session.state === 'active'
      ? r.session.accumMs + (now - (r.session.startedAt || now))
      : r.session.accumMs;
    const program = programs.find((p) => p.id === r.programId);
    // Snapshot the session
    const completed = {
      round: r.currentRound, dayIdx: r.currentDayIdx,
      startedAt: r.session.firstStartedAt || r.session.startedAt,
      finishedAt: now,
      durationMs: elapsed,
      log: r.log, actuals: r.actuals,
    };
    // Advance position
    let nextDay = r.currentDayIdx + 1;
    let nextRound = r.currentRound;
    let status = r.status;
    if (nextDay >= program.workoutDaysPerRound) {
      nextDay = 0; nextRound += 1;
    }
    if (nextRound > program.rounds) {
      status = 'complete';
      nextRound = program.rounds; nextDay = program.workoutDaysPerRound - 1;
    }
    return {
      ...r,
      sessions: [...r.sessions, completed],
      currentRound: nextRound,
      currentDayIdx: nextDay,
      status,
      session: { state: 'idle', startedAt: null, accumMs: 0, pausedAt: null },
    };
  });
  // Set per-exercise actuals (weight/reps/sets override for the active day).
  const setActuals = (exId, patch) => updateRun(activeRunId, (r) => {
    const key = `${exId}-r${r.currentRound}-d${r.currentDayIdx}`;
    const cur = r.actuals[key] || {};
    return { ...r, actuals: { ...r.actuals, [key]: { ...cur, ...patch }}};
  });
  // Set per-set actuals — overrides for a specific set index within an exercise.
  const setSetActuals = (exId, setIdx, patch) => updateRun(activeRunId, (r) => {
    const key = `${exId}-r${r.currentRound}-d${r.currentDayIdx}`;
    const cur = r.actuals[key] || {};
    const perSet = { ...(cur.perSet || {}) };
    perSet[setIdx] = { ...(perSet[setIdx] || {}), ...patch };
    return { ...r, actuals: { ...r.actuals, [key]: { ...cur, perSet }}};
  });

  const adoptProgram = (program, bump = 2.5) => {
    // End current run (if any) and start a new one for the chosen program.
    if (activeRunId) updateRun(activeRunId, { status: 'cancelled', endedOn: new Date().toISOString().slice(0, 10) });
    // Find past peak of this program; use to bump start weights if available.
    const past = runs.filter((r) => r.programId === program.id && r.peakWeights).slice(-1)[0];
    const startWeights = defaultStartWeights();
    if (past?.peakWeights) {
      // Bump-per-cycle model: new start = previous start + bump (not peak — peak is too high).
      for (const k of Object.keys(startWeights)) {
        const prevStart = past.startWeights?.[k] ?? startWeights[k];
        startWeights[k] = prevStart + bump;
      }
    }
    const newRun = makeRun(program.id, { startWeights, status: 'active' });
    setRuns((rs) => [...rs, newRun]);
    setActiveRunId(newRun.id);
    setTab('active');
  };
  // (Future: pauseRun, endRun — surfaced from Catalogue detail or via menu.)

  const tabs = [
    { id: 'active',    label: T('tab.active'),    icon: 'today' },
    { id: 'progress',  label: T('tab.stats'),     icon: 'stats' },
    { id: 'catalogue', label: T('tab.catalogue'), icon: 'lib' },
    { id: 'settings',  label: T('tab.settings'),  icon: 'sliders' },
  ];

  // ── Screen routing ──
  let screen;
  if (tab === 'active') {
    if (activeRun && activeProgram) {
      screen = <ScreenToday units={tweaks.units} program={activeProgram} run={activeRun}
                            density={tweaks.density} onLog={onLog}
                            startSession={startSession} pauseSession={pauseSession}
                            resumeSession={resumeSession} finishSession={finishSession}
                            setActuals={setActuals} setSetActuals={setSetActuals} />;
    } else {
      screen = <EmptyActive onGoCatalogue={() => setTab('catalogue')} />;
    }
  }
  if (tab === 'progress') {
    if (activeRun && activeProgram) {
      screen = <ScreenStats program={activeProgram} run={activeRun} groups={SEED_GROUPS}
                            units={tweaks.units} density={tweaks.density} />;
    } else {
      screen = <EmptyActive onGoCatalogue={() => setTab('catalogue')} />;
    }
  }
  if (tab === 'catalogue') {
    screen = <ScreenCatalogue programs={programs} runs={runs} activeRunId={activeRunId}
                              onAdopt={adoptProgram}
                              units={tweaks.units} density={tweaks.density} />;
  }
  if (tab === 'settings') {
    screen = <ScreenSettings tweaks={tweaks} setTweak={setTweak}
                             units={tweaks.units} density={tweaks.density} />;
  }

  return (
    <div className="stage" style={{ background: theme.bg }} data-screen-label="Jackhammer">
      <PhoneShell>
        {screen}
        <BottomTabs value={tab} onChange={setTab} items={tabs} />
      </PhoneShell>

      {/* Side label */}
      <div style={{
        position: 'fixed', left: 24, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
        transformOrigin: 'left center',
        fontFamily: theme.mono, fontSize: 10, color: theme.fgDim, letterSpacing: 3, textTransform: 'uppercase',
        whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        {T('brand.name')} · v0.0.0
      </div>

      <TweaksPanel title={T('tw.title')}>
        <TweakSection label={T('tw.language')} />
        <TweakRadio label={T('tw.languageSel')} value={tweaks.lang || 'ru'}
                    options={LANGS.map((l) => ({ value: l.id, label: l.label }))}
                    onChange={(v) => setTweak('lang', v)} />

        <TweakSection label={T('tw.units')} />
        <TweakRadio label={T('tw.unitSystem')} value={tweaks.units}
                    options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]}
                    onChange={(v) => setTweak('units', v)} />

        <TweakSection label={T('tw.palette')} />
        <TweakColor label={T('tw.theme')} value={[
                      PALETTES[tweaks.palette].bg,
                      PALETTES[tweaks.palette].fg,
                      PALETTES[tweaks.palette].accent,
                      PALETTES[tweaks.palette].signal,
                    ]}
                    options={[
                      [PALETTES.cape.bg, PALETTES.cape.fg, PALETTES.cape.accent, PALETTES.cape.signal],
                      [PALETTES.cave.bg, PALETTES.cave.fg, PALETTES.cave.accent, PALETTES.cave.signal],
                      [PALETTES.daylight.bg, PALETTES.daylight.fg, PALETTES.daylight.accent, PALETTES.daylight.signal],
                    ]}
                    onChange={(arr) => {
                      const map = { [PALETTES.cape.bg]: 'cape', [PALETTES.cave.bg]: 'cave', [PALETTES.daylight.bg]: 'daylight' };
                      setTweak('palette', map[arr[0]] || 'cape');
                    }} />

        <TweakSection label={T('tw.typography')} />
        <TweakRadio label={T('tw.typeface')} value={tweaks.typeface}
                    options={[
                      { value: 'tactical',   label: 'Geist' },
                      { value: 'editorial',  label: 'Bricolage' },
                      { value: 'industrial', label: 'Archivo' },
                    ]}
                    onChange={(v) => setTweak('typeface', v)} />

        <TweakSection label={T('tw.layout')} />
        <TweakRadio label={T('tw.density')} value={tweaks.density}
                    options={[
                      { value: 'compact', label: T('tw.compact') },
                      { value: 'comfy',   label: T('tw.comfy') },
                    ]}
                    onChange={(v) => setTweak('density', v)} />

        <TweakSection label={T('tw.jump')} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map((tt) => (
            <TweakButton key={tt.id} label={tt.label}
                         secondary={tt.id !== tab}
                         onClick={() => setTab(tt.id)} />
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
}

// Shown when no active run — Active and Progress tabs both land here.
function EmptyActive({ onGoCatalogue }) {
  const t = useTheme();
  const T = useT();
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 32,
      paddingBottom: 110, gap: 14,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: t.surface2,
        border: `1px solid ${t.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="lib" size={28} color={t.fgMute} />
      </div>
      <div style={{ fontFamily: t.ui, fontSize: 18, fontWeight: 600, color: t.fg, textAlign: 'center' }}>
        No active program
      </div>
      <div style={{ fontFamily: t.mono, fontSize: 11, color: t.fgMute, textAlign: 'center', lineHeight: 1.5 }}>
        Pick one from the catalogue to start training.<br/>
        Soviet classics + your custom blocks.
      </div>
      <Btn variant="accent" size="md" icon="play" onClick={onGoCatalogue}>
        {T('cat.title')}
      </Btn>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
