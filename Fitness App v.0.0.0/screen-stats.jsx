// screen-stats.jsx — long-range plan + progress charts.

// Long-form projection chart for a given lift (rounds → kg).
const ProjectionChart = ({ data, units, height = 160, accent, signal }) => {
  const t = useTheme();
  const W = 350; const H = height;
  const PADX = 12; const PADY = 18;
  const min = Math.min(...data.map((d) => d.kg)) * 0.95;
  const max = Math.max(...data.map((d) => d.kg)) * 1.02;
  const range = max - min || 1;
  const stepX = (W - PADX * 2) / (data.length - 1 || 1);
  const yOf = (kg) => H - PADY - ((kg - min) / range) * (H - PADY * 2);

  // Build path
  const points = data.map((d, i) => ({ x: PADX + i * stepX, y: yOf(d.kg), ...d }));
  const linePath = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1].x.toFixed(1)},${H - PADY} L${points[0].x.toFixed(1)},${H - PADY} Z`;

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* gridlines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={PADX} x2={W - PADX} y1={PADY + (H - PADY * 2) * f} y2={PADY + (H - PADY * 2) * f}
                stroke={t.line} strokeDasharray="2 4" />
        ))}
        {/* area */}
        <defs>
          <linearGradient id="proj-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent || t.accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accent || t.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#proj-grad)" />
        {/* line */}
        <path d={linePath} fill="none" stroke={accent || t.accent} strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />
        {/* recovery markers */}
        {points.map((p, i) => p.isRecovery && (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={t.bg} stroke={signal || t.signal} strokeWidth="2" />
          </g>
        ))}
        {/* current round marker */}
        {points.length > 2 && (
          <g>
            <line x1={points[2].x} x2={points[2].x} y1={PADY} y2={H - PADY}
                  stroke={accent || t.accent} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 3" />
            <circle cx={points[2].x} cy={points[2].y} r="5" fill={accent || t.accent} />
            <circle cx={points[2].x} cy={points[2].y} r="2" fill={t.bg} />
          </g>
        )}
      </svg>
      {/* X labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '0 8px',
        marginTop: 4, fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 0.4,
      }}>
        {data.length <= 8
          ? data.map((d) => <span key={d.round}>R{d.round}</span>)
          : [data[0], data[Math.floor(data.length / 4)], data[Math.floor(data.length / 2)], data[Math.floor(data.length * 0.75)], data[data.length - 1]].map((d) => <span key={d.round}>R{d.round}</span>)
        }
      </div>
    </div>
  );
};

// Historic progress card (mocked past data).
const HistoryCard = ({ exId, units }) => {
  const t = useTheme();
  const T = useT();
  const ex = findExercise(exId);
  const group = findGroup(ex.group);
  // Mock 8 sessions ago → today
  const history = Array.from({ length: 8 }, (_, i) => {
    const w = ex.startKg + i * group.formula.amount * 0.6;
    return snapForUnits(w, group, ex.equip, 'kg');
  });
  const current = history[history.length - 1];
  const prev = history[history.length - 2];
  const delta = current - prev;
  const projection = projectedKg(ex, group, 6, SEED_PROGRAM);
  const projSnapped = snapForUnits(projection, group, ex.equip, 'kg');

  return (
    <Card padding={14}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <GroupDot id={group.id} size={10} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.ui, fontWeight: 600, fontSize: 14, color: t.fg }}>{T(ex.nameKey)}</div>
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginTop: 1 }}>{T(group.nameKey).toUpperCase()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: t.mono, fontSize: 22, fontWeight: 700, color: t.fg, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {fmtWeight(current, units)}
            </span>
            <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgMute }}>{unitLabel(units)}</span>
          </div>
          <div style={{ marginTop: 2 }}>
            <Pill tone={delta > 0 ? 'success' : 'mute'} mono>
              {delta > 0 ? '▲' : '—'} {fmtWeight(Math.abs(delta), units)} {unitLabel(units)}
            </Pill>
          </div>
        </div>
      </div>

      {/* sparkline */}
      <Sparkline data={history} width={320} height={40} color={t.accent} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
        padding: '8px 10px', background: t.surface2, borderRadius: 8, border: `1px solid ${t.line}`,
      }}>
        <Icon name="target" size={14} color={t.signal} />
        <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgMute, flex: 1, letterSpacing: 0.4 }}>
          {T('stats.r6proj', { n: 6 })}
        </span>
        <span style={{ fontFamily: t.mono, fontSize: 11, color: t.signal, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {fmtWeight(projSnapped, units)} {unitLabel(units)}
        </span>
      </div>
    </Card>
  );
};

// Yearly plan strip — multi-block view with deload dots.
const YearStrip = ({ program, blocks }) => {
  const t = useTheme();
  const T = useT();
  return (
    <Card padding={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Icon name="cal" size={16} color={t.fg} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.ui, fontWeight: 600, fontSize: 14, color: t.fg }}>{T('stats.year.title', { y: 2026 })}</div>
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginTop: 1 }}>{T('stats.year.sub', { n: blocks.length, r: blocks.reduce((s, b) => s + b.rounds, 0) })}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {blocks.map((b, bi) => (
          <div key={bi}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: t.ui, fontSize: 11, fontWeight: 600, color: bi === 0 ? t.accent : t.fgMute, letterSpacing: 0.2 }}>
                {b.name}
              </span>
              <span style={{ fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                {b.window} · {b.focus}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: b.rounds }, (_, i) => {
                const r = i + 1;
                const isRec = r % 6 === 0;
                const cur = bi === 0 && r === program.currentRound;
                const past = bi === 0 && r < program.currentRound;
                return (
                  <div key={i} style={{
                    flex: 1, height: 12, borderRadius: 2,
                    background: cur ? t.accent
                              : isRec ? t.signal
                              : past ? t.fgMute
                              : bi === 0 ? t.surface2 : t.surface2,
                    opacity: cur ? 1 : isRec ? 0.75 : past ? 0.6 : bi === 0 ? 1 : 0.5,
                  }} />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.line}`,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <KV label={T('stats.yearGoal', { y: 2026, lift: T('stats.lift.bench') })} value="135 → 165" unit="kg" />
        <KV label={T('stats.yearGoal', { y: 2026, lift: T('stats.lift.squat') })} value="180" unit="kg" />
        <KV label={T('stats.yearGoal', { y: 2026, lift: T('stats.lift.dead') })} value="220" unit="kg" />
      </div>
    </Card>
  );
};

const ScreenStats = ({ program, run, groups, units, density }) => {
  const t = useTheme();
  const T = useT();
  const [lift, setLift] = React.useState('bench');
  const ex = exerciseInRun(lift, run);
  const group = findGroup(ex.group);
  const planData = generatePlan(program, lift, 'kg', run).map((d) => ({ ...d, kg: d.kg }));

  const YEAR_BLOCKS = [
    { name: `${T('phase.strength')} · ${T('phase.wave')} I`,  rounds: 6, window: 'Apr–May', focus: T('stats.focus.strength') },
    { name: `${T('phase.hyper')} · ${T('phase.wave')} II`,    rounds: 6, window: 'Jun–Jul', focus: T('stats.focus.hyper') },
    { name: `${T('phase.power')} · ${T('phase.wave')} III`,   rounds: 8, window: 'Aug–Oct', focus: T('stats.focus.power') },
    { name: `${T('phase.maintain')} · ${T('phase.wave')} IV`, rounds: 4, window: 'Nov–Dec', focus: T('stats.focus.maintain') },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 110 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brand size={14} />
          <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, letterSpacing: 1.4, textTransform: 'uppercase' }}>{T('tab.stats')}</span>
        </div>
        <Btn variant="quiet" size="sm" icon="sliders">{T('common.filter')}</Btn>
      </div>

      <TopBar sub={T('stats.sub')} title={T('tab.stats')} />

      {/* KPI row */}
      <div style={{ padding: '4px 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Card padding={12}>
          <KV label={T('stats.sessions')} value="47" />
          <div style={{ marginTop: 8 }}>
            <Sparkline data={[2,3,3,4,4,3,4,5,4,4,5,5]} width={140} height={28} color={t.accent} />
          </div>
        </Card>
        <Card padding={12}>
          <KV label={T('stats.tonnage')} value="184.2" unit={units === 'lb' ? 'klb' : 't'} />
          <div style={{ marginTop: 8 }}>
            <Sparkline data={[8,10,12,11,14,15,17,16,19,21,22,24]} width={140} height={28} color={t.signal} />
          </div>
        </Card>
      </div>

      {/* Long-form projection */}
      {(() => {
        // peak = max projected, NOT the last round (which is a deload).
        const peakIdx = planData.reduce((mi, d, i, arr) => d.kg > arr[mi].kg ? i : mi, 0);
        const peak = planData[peakIdx];
        const delta = peak.kg - ex.startKg;
        const deltaSign = delta > 0 ? '+' : delta < 0 ? '−' : '';
        return (
          <Section eyebrow={T('stats.projection')} title={T(ex.nameKey)}
                   action={
                     <div style={{ display: 'flex', gap: 4 }}>
                       {['bench', 'squat', 'dead', 'ohp'].map((id) => {
                         const active = id === lift;
                         // 3-char codes keep the row narrow so the title doesn't wrap.
                         const code = { bench: 'BNC', squat: 'SQT', dead: 'DDL', ohp: 'OHP' }[id];
                         return (
                           <button key={id} onClick={() => setLift(id)} style={{
                             padding: '4px 7px', borderRadius: 6,
                             background: active ? t.fg : t.surface2,
                             color: active ? t.bg : t.fgMute,
                             border: 0, cursor: 'pointer',
                             fontFamily: t.mono, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4,
                           }}>{code}</button>
                         );
                       })}
                     </div>
                   }
                   style={{ padding: '0 16px 4px' }}>
            <Card padding={14}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: t.mono, fontSize: 28, fontWeight: 700, color: t.fg, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {fmtWeight(peak.kg, units)}
                  </span>
                  <span style={{ fontFamily: t.mono, fontSize: 11, color: t.fgMute }}>{unitLabel(units)}</span>
                  <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginLeft: 4 }}>{T('stats.peakAt', { n: peak.round })}</span>
                </div>
                {delta !== 0 && (
                  <Pill tone={delta > 0 ? 'accent' : 'mute'}>
                    {deltaSign}{fmtWeight(Math.abs(delta), units)} {unitLabel(units).toUpperCase()}
                  </Pill>
                )}
              </div>
              <ProjectionChart data={planData} units={units} accent={t.accent} signal={t.signal} />
              <div style={{
                display: 'flex', gap: 10, marginTop: 8, padding: '8px 0 0',
                borderTop: `1px solid ${t.line}`,
              }}>
                <KV label={T('common.start')} value={fmtWeight(ex.startKg, units)} unit={unitLabel(units)} />
                <KV label={T('common.peak')} value={fmtWeight(peak.kg, units)} unit={unitLabel(units)} color={t.accent} />
                <KV label={T('common.step')} value={`+${group.formula.amount}`} unit={group.formula.unit === 'kg' ? unitLabel(units) : group.formula.unit} />
                <KV label={T('common.deload')} value={`R${program.recovery.every}`} color={t.signal} />
              </div>
            </Card>
          </Section>
        );
      })()}

      {/* History per exercise */}
      <Section eyebrow={T('stats.logs')} title={T('stats.recent')} style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <HistoryCard exId="bench" units={units} />
          <HistoryCard exId="squat" units={units} />
          <HistoryCard exId="dead" units={units} />
        </div>
      </Section>

      {/* Yearly plan */}
      <Section eyebrow={T('stats.longGame')} title={T('stats.yearMap', { y: 2026 })} style={{ padding: '14px 16px 0' }}>
        <YearStrip program={program} blocks={YEAR_BLOCKS} />
      </Section>
    </div>
  );
};

Object.assign(window, { ScreenStats });
