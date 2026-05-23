// screen-settings.jsx — user-facing settings: language, units, plate library, version.

const SettingsRow = ({ icon, label, value, action, onClick, density }) => {
  const t = useTheme();
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: `${density === 'compact' ? 10 : 14}px ${density === 'compact' ? 12 : 16}px`,
      borderBottom: `1px solid ${t.line}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 7, background: t.surface2,
          border: `1px solid ${t.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={icon} size={15} color={t.fgMute} />
        </div>
      )}
      <div style={{ flex: 1, fontFamily: t.ui, fontSize: 13, fontWeight: 500, color: t.fg }}>
        {label}
      </div>
      {value && (
        <span style={{ fontFamily: t.mono, fontSize: 12, color: t.fgMute, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
      )}
      {action}
    </div>
  );
};

const SettingsGroup = ({ title, children }) => {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: t.mono, fontSize: 9, color: t.fgDim, letterSpacing: 1.4, textTransform: 'uppercase',
        padding: '0 20px 6px',
      }}>{title}</div>
      <div style={{
        background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
        margin: '0 16px', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
};

// Inline pill selector (used for language, units).
const InlineSelector = ({ value, options, onChange }) => {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const active = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            padding: '5px 10px', borderRadius: 6,
            background: active ? t.fg : t.surface2,
            color: active ? t.bg : t.fgMute,
            border: 0, cursor: 'pointer',
            fontFamily: t.mono, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4,
          }}>{l}</button>
        );
      })}
    </div>
  );
};

const ScreenSettings = ({ tweaks, setTweak, units, density }) => {
  const t = useTheme();
  const T = useT();

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 110 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brand size={14} />
          <span style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, letterSpacing: 1.4, textTransform: 'uppercase' }}>{T('tab.settings')}</span>
        </div>
      </div>

      <TopBar sub={T('set.sub')} title={T('set.title')} />

      <div style={{ marginTop: 10 }}>
        {/* APP */}
        <SettingsGroup title={T('set.section.app')}>
          <SettingsRow icon="sliders" density={density}
                       label={T('set.lang')}
                       action={<InlineSelector value={tweaks.lang || 'en'}
                                               options={LANGS.map((l) => ({ value: l.id, label: l.label }))}
                                               onChange={(v) => setTweak('lang', v)} />} />
          <SettingsRow icon="bolt" density={density}
                       label={T('set.unit')}
                       action={<InlineSelector value={units}
                                               options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]}
                                               onChange={(v) => setTweak('units', v)} />} />
        </SettingsGroup>

        {/* GYM — Plate library */}
        <SettingsGroup title={T('set.section.gym')}>
          {EQUIP_CONFIG.map((eq, i) => (
            <div key={eq.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: `${density === 'compact' ? 10 : 14}px ${density === 'compact' ? 12 : 16}px`,
              borderBottom: i < EQUIP_CONFIG.length - 1 ? `1px solid ${t.line}` : 'none',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, background: t.surface2,
                border: `1px solid ${t.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontFamily: t.mono, fontSize: 10, fontWeight: 700, color: t.fgMute,
              }}>
                {eq.id === 'barbell' ? 'BB' : eq.id === 'dumbbell' ? 'DB' : eq.id === 'cable' ? 'CB' : 'BW'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: t.ui, fontSize: 13, fontWeight: 500, color: t.fg }}>{T(eq.labelKey)}</div>
                <div style={{ fontFamily: t.mono, fontSize: 10, color: t.fgDim, marginTop: 1 }}>{T(eq.noteKey)}</div>
              </div>
              <Stepper value={units === 'lb' ? eq.smallestLb : eq.smallestKg}
                       step={units === 'lb' ? 0.5 : 0.25}
                       min={0.25} max={5}
                       suffix={unitLabel(units)}
                       onChange={() => {}} width={92} />
            </div>
          ))}
        </SettingsGroup>

        {/* ABOUT */}
        <SettingsGroup title={T('set.section.about')}>
          <SettingsRow icon="shield" density={density}
                       label={T('brand.name')}
                       value="v0.0.0" />
          <SettingsRow icon="edit" density={density}
                       label={T('set.feedback')}
                       action={<Icon name="chev" size={14} color={t.fgDim} />}
                       onClick={() => {}} />
        </SettingsGroup>
      </div>
    </div>
  );
};

Object.assign(window, { ScreenSettings });
