// data.jsx — domain model, helpers, mock seed.

// ─── Theme ──────────────────────────────────────────────────────────────────
// Each palette is the same shape; switching palettes via Tweaks swaps these.
const PALETTES = {
  cape: {
    name: 'Cape',
    bg: '#0a0a0c', surface: '#131316', surface2: '#1c1c20', line: 'rgba(255,255,255,0.07)', lineStrong: 'rgba(255,255,255,0.15)',
    fg: '#f5f3ef', fgMute: 'rgba(245,243,239,0.62)', fgDim: 'rgba(245,243,239,0.36)',
    accent: '#ff3344', accentDim: 'rgba(255,51,68,0.16)',
    signal: '#ffd60a', signalDim: 'rgba(255,214,10,0.16)',
    success: '#5dc7a7',
  },
  cave: {
    name: 'Cave',
    bg: '#070708', surface: '#101012', surface2: '#181819', line: 'rgba(255,255,255,0.06)', lineStrong: 'rgba(255,255,255,0.12)',
    fg: '#fafafa', fgMute: 'rgba(250,250,250,0.55)', fgDim: 'rgba(250,250,250,0.3)',
    accent: '#ffffff', accentDim: 'rgba(255,255,255,0.1)',
    signal: '#bdbdbd', signalDim: 'rgba(189,189,189,0.14)',
    success: '#9aa39a',
  },
  daylight: {
    name: 'Daylight',
    bg: '#f5f3ef', surface: '#ffffff', surface2: '#f0ede7', line: 'rgba(0,0,0,0.08)', lineStrong: 'rgba(0,0,0,0.18)',
    fg: '#0e0e10', fgMute: 'rgba(14,14,16,0.62)', fgDim: 'rgba(14,14,16,0.36)',
    accent: '#d62839', accentDim: 'rgba(214,40,57,0.12)',
    signal: '#e8a200', signalDim: 'rgba(232,162,0,0.16)',
    success: '#2f8a6a',
  },
};

const TYPE_PRESETS = {
  tactical:   { ui: "'Geist', ui-sans-serif, system-ui, sans-serif",        mono: "'Geist Mono', ui-monospace, monospace",     display: "'Geist', sans-serif",            displayWeight: 800, uiWeight: 500 },
  editorial:  { ui: "'Bricolage Grotesque', ui-sans-serif, sans-serif",     mono: "'JetBrains Mono', ui-monospace, monospace", display: "'Bricolage Grotesque', serif",   displayWeight: 700, uiWeight: 500 },
  industrial: { ui: "'Archivo', ui-sans-serif, system-ui, sans-serif",      mono: "'IBM Plex Mono', ui-monospace, monospace",  display: "'Archivo', sans-serif",          displayWeight: 800, uiWeight: 500 },
};

// Density token: padding/font scale baked into one card multiplier.
const DENSITY = {
  compact: { pad: 10, gap: 8,  cardR: 14, line: 1.25, h1: 28, h2: 18, body: 13, micro: 10 },
  comfy:   { pad: 14, gap: 12, cardR: 18, line: 1.4,  h1: 34, h2: 22, body: 15, micro: 11 },
};

// ─── Exercise groups ─────────────────────────────────────────────────────────
// Each group carries its own progression formula + plate snap.
// Plates: smallest *single-side* plate available. Barbell adds 2× when loading.
const SEED_GROUPS = [
  { id: 'big',    name: 'Big Lifts',  nameKey: 'group.big',    blurbKey: 'group.big.blurb',    blurb: 'Squat / Bench / Deadlift / OHP',
    formula: { kind: 'linear', amount: 2.5, unit: 'kg', per: 'round' }, plateKg: 2.5, plateLb: 5 },
  { id: 'medium', name: 'Medium',     nameKey: 'group.medium', blurbKey: 'group.medium.blurb', blurb: 'Rows · RDL · Incline · Front squat',
    formula: { kind: 'linear', amount: 2.5, unit: 'kg', per: 'round' }, plateKg: 1.25, plateLb: 2.5 },
  { id: 'small',  name: 'Small / Iso',nameKey: 'group.small',  blurbKey: 'group.small.blurb',  blurb: 'Curls · Raises · Triceps',
    formula: { kind: 'linear', amount: 1.0, unit: 'kg', per: 'round' }, plateKg: 1, plateLb: 2.5 },
  { id: 'cardio', name: 'Cardio',     nameKey: 'group.cardio', blurbKey: 'group.cardio.blurb', blurb: 'Conditioning · Carries · Sprints',
    formula: { kind: 'time',   amount: 30,  unit: 's',  per: 'round' }, plateKg: null, plateLb: null },
];

// ─── Exercise catalogue (seed) ───────────────────────────────────────────────
const SEED_EXERCISES = [
  { id: 'bench',   name: 'Bench Press',          nameKey: 'ex.bench',  group: 'big',    equip: 'barbell',  startKg: 110, sets: 5, reps: 5, restSec: 180 },
  { id: 'squat',   name: 'Back Squat',           nameKey: 'ex.squat',  group: 'big',    equip: 'barbell',  startKg: 140, sets: 5, reps: 5, restSec: 210 },
  { id: 'dead',    name: 'Deadlift',             nameKey: 'ex.dead',   group: 'big',    equip: 'barbell',  startKg: 170, sets: 3, reps: 5, restSec: 240 },
  { id: 'ohp',     name: 'Overhead Press',       nameKey: 'ex.ohp',    group: 'big',    equip: 'barbell',  startKg: 65,  sets: 5, reps: 5, restSec: 180 },
  { id: 'row',     name: 'Pendlay Row',          nameKey: 'ex.row',    group: 'medium', equip: 'barbell',  startKg: 80,  sets: 4, reps: 6, restSec: 150 },
  { id: 'rdl',     name: 'Romanian Deadlift',    nameKey: 'ex.rdl',    group: 'medium', equip: 'barbell',  startKg: 120, sets: 3, reps: 8, restSec: 150 },
  { id: 'incdb',   name: 'Incline DB Press',     nameKey: 'ex.incdb',  group: 'medium', equip: 'dumbbell', startKg: 30,  sets: 3, reps: 8, restSec: 120 },
  { id: 'chin',    name: 'Weighted Chin-up',     nameKey: 'ex.chin',   group: 'medium', equip: 'bw+',      startKg: 15,  sets: 4, reps: 6, restSec: 150 },
  { id: 'curl',    name: 'Barbell Curl',         nameKey: 'ex.curl',   group: 'small',  equip: 'barbell',  startKg: 35,  sets: 3, reps: 10, restSec: 90 },
  { id: 'tri',     name: 'Tricep Pushdown',      nameKey: 'ex.tri',    group: 'small',  equip: 'cable',    startKg: 32,  sets: 3, reps: 12, restSec: 75 },
  { id: 'lat',     name: 'Lateral Raise',        nameKey: 'ex.lat',    group: 'small',  equip: 'dumbbell', startKg: 9,   sets: 4, reps: 12, restSec: 60 },
  { id: 'face',    name: 'Face Pull',            nameKey: 'ex.face',   group: 'small',  equip: 'cable',    startKg: 20,  sets: 3, reps: 15, restSec: 60 },
  { id: 'sprint',  name: 'Sled Sprints',         nameKey: 'ex.sprint', group: 'cardio', equip: '—',        startKg: 0,   sets: 6, reps: 1, restSec: 120, distM: 30, baseSec: 240 },
  { id: 'carry',   name: 'Farmer Carry',         nameKey: 'ex.carry',  group: 'cardio', equip: 'dumbbell', startKg: 40,  sets: 4, reps: 1, restSec: 90,  baseSec: 60 },
];

// Equipment label key — maps raw `equip` tag to an i18n key for short display.
const EQUIP_LABEL_KEY = {
  'barbell': 'eq.barbell', 'dumbbell': 'eq.dumbbell',
  'cable': 'eq.cable', 'machine': 'eq.machine',
  'bw+': 'eq.bw', '—': 'eq.none',
};
function equipKey(equip) { return EQUIP_LABEL_KEY[equip] || 'eq.none'; }

// ─── PROGRAMS CATALOGUE ──────────────────────────────────────────────────────
// Each program is a self-contained training plan: schedule (days), formula
// overrides per group, deload cadence. Programs are the templates; runs are
// instantiations of a program with a start date, starting weights, and a log.
//
// `formulaOverrides` lets a program override the default per-group formula
// (e.g. RSR pushes squats at +5kg/round, faster than the default +2.5).
// Anything missing falls back to SEED_GROUPS[g].formula.

const SEED_PROGRAMS = [
  // ── Linear Novice ──────────────────────────────────────────────────────────
  {
    id: 'linear',
    nameKey: 'preset.linear.name', authorKey: 'preset.linear.author',
    yearKey: 'preset.linear.year', blurbKey: 'preset.linear.blurb',
    builtin: true, tagKey: 'preset.tag.novice',
    rounds: 12, roundDays: 7, workoutDaysPerRound: 3,
    recovery: { every: 8, length: 1, intensity: 0.7 },
    formulaOverrides: {}, // standard formulas
    days: [
      { id: 'A', labelKey: 'day.heavyPush', exercises: ['squat', 'bench', 'row'] },
      { id: 'B', labelKey: 'day.legs',      exercises: ['squat', 'ohp',   'dead'] },
      { id: 'C', labelKey: 'day.heavyPull', exercises: ['squat', 'bench', 'row'] },
    ],
  },

  // ── Russian Squat Routine (Plotkin) ────────────────────────────────────────
  // 6-week wave-loaded squat specialization. Squat 3×/wk with light assistance.
  // Bigger step on squat (+5 kg/round) — this is a peaking cycle.
  {
    id: 'rsr',
    nameKey: 'preset.rsr.name', authorKey: 'preset.rsr.author',
    yearKey: 'preset.rsr.year', blurbKey: 'preset.rsr.blurb',
    builtin: true, tagKey: 'preset.tag.specialty',
    rounds: 6, roundDays: 7, workoutDaysPerRound: 3,
    recovery: { every: 6, length: 1, intensity: 0.75 },
    formulaOverrides: {
      big: { kind: 'linear', amount: 5, unit: 'kg', per: 'round' }, // aggressive
    },
    days: [
      { id: 'A', labelKey: 'preset.rsr.dayA', exercises: ['squat', 'row',  'curl'] },
      { id: 'B', labelKey: 'preset.rsr.dayB', exercises: ['squat', 'ohp',  'lat'] },
      { id: 'C', labelKey: 'preset.rsr.dayC', exercises: ['squat', 'dead', 'carry'] },
    ],
  },

  // ── Smolov Jr. — Bench (Smolov) ────────────────────────────────────────────
  // 3-week bench specialization. Bench 4×/wk with rotating reps/intensity.
  {
    id: 'smolov-bench',
    nameKey: 'preset.smolovBench.name', authorKey: 'preset.smolovBench.author',
    yearKey: 'preset.smolovBench.year', blurbKey: 'preset.smolovBench.blurb',
    builtin: true, tagKey: 'preset.tag.specialty',
    rounds: 3, roundDays: 7, workoutDaysPerRound: 4,
    recovery: { every: 4, length: 1, intensity: 0.7 },
    formulaOverrides: {
      big: { kind: 'linear', amount: 2.5, unit: 'kg', per: 'round' },
      medium: { kind: 'linear', amount: 1.25, unit: 'kg', per: 'round' },
    },
    days: [
      { id: 'A', labelKey: 'preset.smolov.dayA', exercises: ['bench', 'tri',   'ohp'] },
      { id: 'B', labelKey: 'preset.smolov.dayB', exercises: ['bench', 'incdb', 'lat'] },
      { id: 'C', labelKey: 'preset.smolov.dayC', exercises: ['bench', 'tri',   'row'] },
      { id: 'D', labelKey: 'preset.smolov.dayD', exercises: ['bench', 'curl',  'face'] },
    ],
  },

  // ── Sheiko #29 (Sheiko) ────────────────────────────────────────────────────
  // High-volume powerlifting program. 4 days/wk, all 3 powerlifts + accessories.
  {
    id: 'sheiko-29',
    nameKey: 'preset.sheiko29.name', authorKey: 'preset.sheiko29.author',
    yearKey: 'preset.sheiko29.year', blurbKey: 'preset.sheiko29.blurb',
    builtin: true, tagKey: 'preset.tag.intermediate',
    rounds: 4, roundDays: 7, workoutDaysPerRound: 4,
    recovery: { every: 4, length: 1, intensity: 0.65 },
    formulaOverrides: {
      big: { kind: 'linear', amount: 2.5, unit: 'kg', per: 'round' },
    },
    days: [
      { id: 'A', labelKey: 'preset.sheiko.dayA', exercises: ['squat', 'bench', 'tri'] },
      { id: 'B', labelKey: 'preset.sheiko.dayB', exercises: ['bench', 'squat', 'incdb'] },
      { id: 'C', labelKey: 'preset.sheiko.dayC', exercises: ['dead',  'squat', 'row'] },
      { id: 'D', labelKey: 'preset.sheiko.dayD', exercises: ['bench', 'squat', 'ohp'] },
    ],
  },

  // ── Sheiko #37 — Light variant ─────────────────────────────────────────────
  {
    id: 'sheiko-37',
    nameKey: 'preset.sheiko37.name', authorKey: 'preset.sheiko37.author',
    yearKey: 'preset.sheiko37.year', blurbKey: 'preset.sheiko37.blurb',
    builtin: true, tagKey: 'preset.tag.intermediate',
    rounds: 4, roundDays: 7, workoutDaysPerRound: 4,
    recovery: { every: 4, length: 1, intensity: 0.7 },
    formulaOverrides: {
      big: { kind: 'linear', amount: 1.25, unit: 'kg', per: 'round' }, // half step
    },
    days: [
      { id: 'A', labelKey: 'preset.sheiko.dayA', exercises: ['squat', 'bench', 'row'] },
      { id: 'B', labelKey: 'preset.sheiko.dayB', exercises: ['bench', 'tri',   'lat'] },
      { id: 'C', labelKey: 'preset.sheiko.dayC', exercises: ['dead',  'row',   'curl'] },
      { id: 'D', labelKey: 'preset.sheiko.dayD', exercises: ['bench', 'squat', 'ohp'] },
    ],
  },

  // ── Custom (the original Strength Block · Wave I) ──────────────────────────
  {
    id: 'custom-strength-1',
    nameKey: 'program.opName', authorKey: 'preset.custom.author',
    yearKey: 'preset.custom.year', blurbKey: 'preset.custom.blurb',
    builtin: false, tagKey: 'preset.tag.custom',
    rounds: 6, roundDays: 7, workoutDaysPerRound: 4,
    recovery: { every: 6, length: 1, intensity: 0.6 },
    formulaOverrides: {},
    days: [
      { id: 'A', labelKey: 'day.heavyPush',   exercises: ['bench', 'ohp', 'incdb', 'tri', 'lat'] },
      { id: 'B', labelKey: 'day.heavyPull',   exercises: ['dead', 'row', 'chin', 'curl', 'face'] },
      { id: 'C', labelKey: 'day.legs',        exercises: ['squat', 'rdl', 'carry'] },
      { id: 'D', labelKey: 'day.conditioning',exercises: ['sprint', 'carry', 'lat', 'face'] },
    ],
  },
];

// ─── RUNS — instantiations of a program ─────────────────────────────────────
// A run carries: which program, when started, lifecycle status, current
// position, starting weights (1RM-ish baselines), and a per-session log.
// Status: 'active' | 'paused' | 'complete' | 'cancelled'.
// `startWeights` is per-exercise; allows the same template to be re-run with
// progressively higher baselines (the textbook overload-between-cycles model).

function defaultStartWeights() {
  const out = {};
  for (const e of SEED_EXERCISES) out[e.id] = e.startKg;
  return out;
}

function makeRun(programId, opts = {}) {
  const date = opts.startedOn || new Date().toISOString().slice(0, 10);
  return {
    id: opts.id || `run-${Math.random().toString(36).slice(2, 8)}`,
    programId,
    runIndex: opts.runIndex || 1,  // 1-indexed within this program's history
    startedOn: date,
    endedOn: opts.endedOn || null,
    status: opts.status || 'active',
    currentRound: opts.currentRound || 1,
    currentDayIdx: opts.currentDayIdx || 0,
    startWeights: opts.startWeights || defaultStartWeights(),
    log: opts.log || {},          // keyed by `${exId}-r${round}-d${dayIdx}` → [bool per set]
    actuals: opts.actuals || {},  // keyed same → { weight, reps, sets } overrides
    dayOverrides: opts.dayOverrides || {},  // per-dayIdx → array of exercise IDs
    sessions: opts.sessions || [],// completed sessions: { round, dayIdx, durationMs, startedAt, finishedAt, log, actuals }
    session: opts.session || {    // currently-in-progress session timer
      state: 'idle', startedAt: null, firstStartedAt: null, accumMs: 0, pausedAt: null,
    },
    peakWeights: opts.peakWeights || {},
  };
}

// ─── Helpers: run history per program ────────────────────────────────────────
// Past runs (any status) for a given program, oldest-first.
function runsForProgram(programId, runs) {
  return runs.filter((r) => r.programId === programId);
}
// Next runIndex to assign when deploying — = (count of existing runs) + 1.
function nextRunIndex(programId, runs) {
  return runsForProgram(programId, runs).length + 1;
}

// ─── Weight step inference — what does ± do for this exercise? ──────────────
// Driven by the smallest plate available on that piece of equipment, doubled
// for barbells (you load both sides). Falls back to 1 kg / 2.5 lb.
function weightStep(exercise, units) {
  const cfg = EQUIP_CONFIG.find((e) => e.id === exercise.equip);
  if (!cfg) return units === 'lb' ? 2.5 : 1;
  const isBar = exercise.equip === 'barbell' || exercise.equip === 'bw+';
  const base = units === 'lb' ? cfg.smallestLb : cfg.smallestKg;
  return isBar ? base * 2 : base;
}

// Seed runs: one active (mid-cycle, with a live timer so the prototype lands
// on something interesting), plus a few completed/cancelled past runs of
// built-in programs so the catalogue backlinks have data to show.
const SEED_RUNS = [
  // Completed linear novice run — last year
  makeRun('linear', {
    id: 'run-linear-1',
    runIndex: 1,
    startedOn: '2025-09-01',
    endedOn: '2025-11-24',
    status: 'complete',
    currentRound: 12, currentDayIdx: 2,
    peakWeights: { bench: 100, squat: 130, dead: 160, ohp: 60 },
  }),
  // Completed Sheiko #29 run — earlier this year
  makeRun('sheiko-29', {
    id: 'run-sheiko29-1',
    runIndex: 1,
    startedOn: '2025-12-15',
    endedOn: '2026-01-12',
    status: 'complete',
    currentRound: 4, currentDayIdx: 3,
    peakWeights: { bench: 115, squat: 150, dead: 180 },
  }),
  // Cancelled Smolov Bench attempt — gave up mid-cycle
  makeRun('smolov-bench', {
    id: 'run-smolov-1',
    runIndex: 1,
    startedOn: '2026-02-01',
    endedOn: '2026-02-22',
    status: 'cancelled',
    currentRound: 2, currentDayIdx: 1,
    peakWeights: { bench: 117 },
  }),
  // Active run — custom strength block, mid-cycle, live timer at landing
  makeRun('custom-strength-1', {
    id: 'run-active',
    runIndex: 1,
    startedOn: '2026-04-20',
    status: 'active',
    currentRound: 3,
    currentDayIdx: 1,
    session: {
      state: 'active',
      startedAt: Date.now() - 14 * 60 * 1000,  // 14 min ago
      firstStartedAt: Date.now() - 14 * 60 * 1000,
      accumMs: 0,
      pausedAt: null,
    },
  }),
];

// Back-compat alias — the legacy SEED_PROGRAM was the custom one.
const SEED_PROGRAM = SEED_PROGRAMS.find((p) => p.id === 'custom-strength-1');

// ─── Helpers: program/run access ────────────────────────────────────────────
function findProgram(id, programs = SEED_PROGRAMS) { return programs.find((p) => p.id === id); }
function findRun(id, runs = SEED_RUNS) { return runs.find((r) => r.id === id); }

// Get the formula a program uses for a given group (override or default).
function formulaFor(program, groupId) {
  return (program?.formulaOverrides && program.formulaOverrides[groupId])
      || (SEED_GROUPS.find((g) => g.id === groupId)?.formula);
}

// ─── Mesocycle layout — spread workouts across the round ─────────────────────
// Given a program with `workoutDaysPerRound` workouts to fit into `roundDays`
// calendar slots, distribute them evenly. e.g. 3 workouts in 7 days → days
// 0, 2, 4 (Mon/Wed/Fri). Returns an array of { dayOfRound, dayTemplateIdx }.
function workoutSlotsForRound(program) {
  const slots = [];
  for (let i = 0; i < program.workoutDaysPerRound; i++) {
    const dayOfRound = Math.floor(i * program.roundDays / program.workoutDaysPerRound);
    slots.push({ dayOfRound, dayTemplateIdx: i });
  }
  return slots;
}
// Look up the day template at a given day-of-round, or null if rest.
function dayTemplateAtRoundDay(program, dayOfRound) {
  const slots = workoutSlotsForRound(program);
  const slot = slots.find((s) => s.dayOfRound === dayOfRound);
  return slot ? { day: program.days[slot.dayTemplateIdx], dayTemplateIdx: slot.dayTemplateIdx } : null;
}

// ─── Per-run day overrides ───────────────────────────────────────────────────
// A run can override its program's day-by-day exercise lists (for add / remove
// / reorder on the Active screen). `run.dayOverrides[dayIdx]` is an array of
// exercise IDs that replaces `program.days[dayIdx].exercises` when set.
// `restoreDayDefault` simply deletes the override.
function effectiveDayExercises(run, program, dayIdx) {
  const override = run?.dayOverrides?.[dayIdx];
  if (override && Array.isArray(override)) return override;
  return program?.days?.[dayIdx]?.exercises || [];
}
function isDayOverridden(run, dayIdx) {
  return !!(run?.dayOverrides && Array.isArray(run.dayOverrides[dayIdx]));
}
// Pure helpers: return a NEW dayOverrides map (caller merges into run via setState).
function _liftOverride(run, program, dayIdx) {
  if (isDayOverridden(run, dayIdx)) return run.dayOverrides[dayIdx].slice();
  return (program?.days?.[dayIdx]?.exercises || []).slice();
}
function addExerciseToDayOverrides(run, program, dayIdx, exId) {
  const next = _liftOverride(run, program, dayIdx);
  next.push(exId);
  return { ...(run.dayOverrides || {}), [dayIdx]: next };
}
function removeExerciseFromDayOverrides(run, program, dayIdx, atIdx) {
  const next = _liftOverride(run, program, dayIdx);
  if (atIdx < 0 || atIdx >= next.length) return run.dayOverrides || {};
  next.splice(atIdx, 1);
  return { ...(run.dayOverrides || {}), [dayIdx]: next };
}
function reorderDayOverrides(run, program, dayIdx, fromIdx, toIdx) {
  const next = _liftOverride(run, program, dayIdx);
  if (fromIdx === toIdx) return run.dayOverrides || {};
  if (fromIdx < 0 || fromIdx >= next.length) return run.dayOverrides || {};
  const [item] = next.splice(fromIdx, 1);
  next.splice(Math.max(0, Math.min(next.length, toIdx)), 0, item);
  return { ...(run.dayOverrides || {}), [dayIdx]: next };
}
function clearDayOverride(run, dayIdx) {
  if (!run.dayOverrides) return {};
  const next = { ...run.dayOverrides };
  delete next[dayIdx];
  return next;
}

// Augment exercise with start weight from active run (so projectedKg sees
// the right baseline). Returns a shallow copy.
function exerciseInRun(exId, run) {
  const ex = findExercise(exId);
  if (!run?.startWeights) return ex;
  return { ...ex, startKg: run.startWeights[exId] ?? ex.startKg };
}

// ─── Math: plate snapping ────────────────────────────────────────────────────
// Snap a raw target weight to the nearest realistic combination of plates,
// given the smallest plate available. Round to multiples of (plate × 2) for
// barbell (both sides), or just the plate itself for fixed-load equipment.
function snapToPlate(rawKg, plateKg, equip) {
  if (!plateKg) return Math.round(rawKg * 10) / 10;
  const step = (equip === 'barbell' || equip === 'bw+') ? plateKg * 2 : plateKg;
  return Math.round(rawKg / step) * step;
}

function snapForUnits(rawKg, group, equip, units) {
  const g = typeof group === 'string' ? SEED_GROUPS.find((gg) => gg.id === group) : group;
  if (!g) return rawKg;
  if (units === 'lb') {
    const rawLb = rawKg * 2.20462;
    const stepLb = g.plateLb ? ((equip === 'barbell' || equip === 'bw+') ? g.plateLb * 2 : g.plateLb) : null;
    if (!stepLb) return Math.round(rawLb * 10) / 10;
    return Math.round(rawLb / stepLb) * stepLb;
  }
  return snapToPlate(rawKg, g.plateKg, equip);
}

// Display weight in selected units.
function fmtWeight(kg, units) {
  if (units === 'lb') return (kg * 2.20462).toFixed(kg % 1 === 0 ? 0 : 1);
  return kg % 1 === 0 ? String(kg) : kg.toFixed(2).replace(/\.?0+$/, '');
}

const unitLabel = (u) => u === 'lb' ? 'lb' : 'kg';

// Date/time formatters — locale tied to unit system:
// kg → European (DD.MM.YYYY · 24h), lb → US (M/D/YYYY · 12h).
function fmtDate(ts, units) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (units === 'lb') return `${d.getMonth() + 1}/${d.getDate()}/${yyyy}`;
  return `${dd}.${mm}.${yyyy}`;
}
function fmtTime(ts, units) {
  const d = new Date(ts);
  if (units === 'lb') return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ─── Math: projection ────────────────────────────────────────────────────────
// projectedKg(exercise, group, round, program) — uses program's formula
// override for the group if present, otherwise the default group formula.
function projectedKg(ex, group, round, program) {
  const g = group || SEED_GROUPS.find((gg) => gg.id === ex.group);
  const f = (program?.formulaOverrides && program.formulaOverrides[g.id]) || g.formula;
  let base = ex.startKg;
  if (f.kind === 'linear' && f.unit === 'kg') {
    base = ex.startKg + (round - 1) * f.amount;
  } else if (f.kind === 'percent') {
    base = ex.startKg * Math.pow(1 + f.amount / 100, round - 1);
  } else if (f.kind === 'time') {
    base = ex.startKg; // weight constant, time progresses
  }
  // Recovery rounds: deload at intensity factor.
  if (program?.recovery && round % program.recovery.every === 0) {
    base = base * program.recovery.intensity;
  }
  return base;
}

// Display projection — snapped to plates, formatted in chosen units.
function displayProjection(ex, group, round, program, units) {
  const raw = projectedKg(ex, group, round, program);
  return fmtWeight(snapForUnits(raw, group, ex.equip, units), units);
}

// ─── Goal calc ───────────────────────────────────────────────────────────────
// roundsToGoal(now, goal, stepKg) → integer rounds to reach goal at stepKg/round.
// Accounts for recovery drag: every Nth round is a deload, so net gain over a
// full cycle of N rounds is (N-1) × step instead of N × step.
function roundsToGoal({ nowKg, goalKg, stepKg, recoveryEvery }) {
  if (goalKg <= nowKg || stepKg <= 0) return 0;
  const needed = goalKg - nowKg;
  if (!recoveryEvery || recoveryEvery <= 1) return Math.ceil(needed / stepKg);
  const cycleGain = (recoveryEvery - 1) * stepKg;
  const fullCycles = Math.floor(needed / cycleGain);
  const remainder = needed - fullCycles * cycleGain;
  const tailRounds = Math.ceil(remainder / stepKg);
  return fullCycles * recoveryEvery + tailRounds;
}

// ─── Generate a long-form plan (n rounds) for the planner ────────────────────
// Optional `run` carries startWeights; we lift those into the exercise so
// projection respects per-run baselines.
function generatePlan(program, exId, units, run) {
  const ex = run ? exerciseInRun(exId, run) : SEED_EXERCISES.find((e) => e.id === exId);
  const g = SEED_GROUPS.find((gg) => gg.id === ex.group);
  const out = [];
  for (let r = 1; r <= program.rounds; r++) {
    const isRecovery = r % program.recovery.every === 0;
    out.push({
      round: r,
      isRecovery,
      kg: snapForUnits(projectedKg(ex, g, r, program), g, ex.equip, units),
      display: displayProjection(ex, g, r, program, units),
    });
  }
  return out;
}

// ─── Formula string formatting ───────────────────────────────────────────────
function formulaText(formula, units) {
  const u = formula.unit === 'kg' ? unitLabel(units) : formula.unit;
  const amount = formula.unit === 'kg' && units === 'lb' ? (formula.amount * 2.20462).toFixed(2).replace(/\.?0+$/, '') : formula.amount;
  if (formula.kind === 'linear')  return `+ ${amount} ${u} / ${formula.per}`;
  if (formula.kind === 'percent') return `+ ${formula.amount}% / ${formula.per}`;
  if (formula.kind === 'time')    return `+ ${formula.amount} ${formula.unit} / ${formula.per}`;
  return '—';
}

// ─── Estimate session duration (real math) ───────────────────────────────
// secPerRep is group-driven; cardio uses ex.baseSec * sets instead.
// Includes between-set rest (only if useRest) and between-exercise transitions.
const SEC_PER_REP = { big: 4, medium: 3, small: 2.5, cardio: 3 };
const TRANSITION_SEC = 45;
function estimateSeconds(exercises, run, useRest = true, defaultRestSec = 90) {
  // When rest is OFF, the est still needs to account for some minimal
  // recovery between sets — call it 30 s. Set this any lower and the est
  // becomes pure work-time fantasy.
  const MIN_REST = 30;
  const restPerSet = useRest ? defaultRestSec : MIN_REST;
  let total = 0;
  for (const ex of exercises) {
    const key = run ? `${ex.id}-r${run.currentRound}-d${run.currentDayIdx}` : null;
    const a = key && run?.actuals ? run.actuals[key] : null;
    const sets = a?.sets ?? ex.sets;
    const reps = ex.reps;
    const work = ex.baseSec
      ? ex.baseSec * sets
      : sets * reps * (SEC_PER_REP[ex.group] || 3);
    const rest = Math.max(0, sets - 1) * restPerSet;
    total += work + rest;
  }
  if (exercises.length > 1) total += (exercises.length - 1) * TRANSITION_SEC;
  return total;
}
function estimateMinutes(exercises, run, useRest = true, defaultRestSec = 90) {
  return Math.round(estimateSeconds(exercises, run, useRest, defaultRestSec) / 60);
}

// ─── Helpers for "today" ────────────────────────────────────────────────────
function findExercise(id) { return SEED_EXERCISES.find((e) => e.id === id); }
function findGroup(id)    { return SEED_GROUPS.find((g) => g.id === id); }

// Surface plate/dumbbell config for the Forge.
const EQUIP_CONFIG = [
  { id: 'barbell',  label: 'Barbell',        labelKey: 'equip.barbell',  noteKey: 'equip.barbell.note',  smallestKg: 1.25, smallestLb: 2.5, note: 'Pair of micros' },
  { id: 'dumbbell', label: 'Dumbbell',       labelKey: 'equip.dumbbell', noteKey: 'equip.dumbbell.note', smallestKg: 1,    smallestLb: 2.5, note: 'Fixed-load rack' },
  { id: 'cable',    label: 'Cable / Machine',labelKey: 'equip.cable',    noteKey: 'equip.cable.note',    smallestKg: 2.5, smallestLb: 5,   note: 'Stack pin' },
  { id: 'bw+',      label: 'Weighted BW',    labelKey: 'equip.bw',       noteKey: 'equip.bw.note',       smallestKg: 1.25, smallestLb: 2.5, note: 'Belt plates' },
];

Object.assign(window, {
  PALETTES, TYPE_PRESETS, DENSITY,
  SEED_GROUPS, SEED_EXERCISES, SEED_PROGRAM, SEED_PROGRAMS, SEED_RUNS, EQUIP_CONFIG,
  snapToPlate, snapForUnits, fmtWeight, unitLabel, fmtDate, fmtTime, weightStep,
  projectedKg, displayProjection, roundsToGoal, generatePlan, formulaText,
  estimateSeconds, estimateMinutes,
  findExercise, findGroup, findProgram, findRun, formulaFor, exerciseInRun, makeRun, defaultStartWeights,
  effectiveDayExercises, isDayOverridden,
  addExerciseToDayOverrides, removeExerciseFromDayOverrides,
  reorderDayOverrides, clearDayOverride,
  workoutSlotsForRound, dayTemplateAtRoundDay,
  runsForProgram, nextRunIndex,
  equipKey,
});
