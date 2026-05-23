// i18n.jsx — translations dictionary + useT() hook.
// Three languages: English, Russian, Chinese (simplified).
// Usage: const T = useT(); <span>{T('today.title')}</span>
//
// Strings are flat-keyed by screen.key. Missing keys fall through to EN.

const LANGS = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'ru', label: 'RU', name: 'Русский' },
  { id: 'zh', label: 'ZH', name: '中文' },
];

const STRINGS = {
  en: {
    // Brand / global
    'brand.name': 'Jackhammer',
    'brand.tagline': 'Jackhammer · Training Programmer · v0.0.0',
    // Tabs
    'tab.today': 'Today', 'tab.program': 'Program', 'tab.forge': 'Forge', 'tab.stats': 'Progress',
    'tab.active': 'Active', 'tab.catalogue': 'Catalogue', 'tab.settings': 'Settings',
    // Common
    'common.add': 'Add', 'common.edit': 'Edit', 'common.use': 'Use', 'common.day': 'Day',
    'common.now': 'now', 'common.deload': 'deload', 'common.upcoming': 'upcoming',
    'common.active': 'ACTIVE', 'common.deloadCaps': 'DELOAD', 'common.auto': 'AUTO', 'common.beta': 'BETA',
    'common.round': 'ROUND', 'common.peak': 'PEAK',
    'common.min': 'min', 'common.reps': 'reps', 'common.rest': 'Rest', 'common.next': 'Next',
    'common.rounds': 'Rounds', 'common.weeks': 'Weeks', 'common.months': 'Months',
    'common.start': 'Start', 'common.step': 'Step/Rd',
    'common.filter': 'Filter',
    // Today
    'today.mission': 'Session', 'today.exercises': 'Exercises', 'today.sets': 'Sets',
    'today.volume': 'Volume', 'today.est': 'Est.',
    'today.adjust': 'Adjust', 'today.finish.title': 'Finish session',
    'today.autoRest': 'Auto rest countdown',
    'today.includeRest': 'Include rest', 'today.defaultRest': 'Default rest',
    'common.startedAt': 'started at', 'common.sec': 'sec',
    'today.finish.sub': 'Locks log · advances to D{n}',
    'today.finish.cta': 'Complete',
    // Program
    'program.active': 'CURRENT BLOCK', 'program.templates': 'Templates',
    'program.geometry': 'Block Geometry',
    'program.geometryDesc': '{r} rounds × {d}d · {w} workouts/round',
    'program.rounds': 'Rounds', 'program.daysPer': 'Days / Round',
    'program.workouts': 'Workouts', 'program.deloadEvery': 'Deload Every',
    'program.cycleMap': 'Cycle Map', 'program.active.r': 'R{n} active',
    'program.library': 'Library', 'program.workoutDays': 'Workout Days', 'program.perRound': 'Per Round',
    'program.restHint': '{n} rest days per round, auto-distributed',
    'program.today': 'TODAY', 'program.exCount': '{n} EX · {s} SETS', 'program.more': '+ {n} more',
    // Forge
    'forge.engine': 'PROGRESSION', 'forge.title': 'Formulas',
    'forge.goal': 'Goal Projector',
    'forge.lift': 'Lift', 'forge.target': 'Target', 'forge.from': 'from',
    'forge.formulaNote': '// @ +{step} kg/round with {n}-round deload',
    'forge.formulaGain': '// gain/cycle = {n} kg',
    'forge.perGroup': 'Per Group', 'forge.progression': 'Progression',
    'forge.plateSnap': 'Plate snap', 'forge.minStep': 'min step {n} (barbell)',
    'forge.plateLibrary': 'Plate Library',
    'forge.deloadProtocol': 'Deload Protocol',
    'forge.every': 'Every', 'forge.length': 'Length', 'forge.intensity': 'Intensity',
    // Formula editor
    'fb.weight': 'weight', 'fb.prev': 'prev', 'fb.per': 'per',
    'fb.session': 'session', 'fb.round': 'round', 'fb.cycle': 'cycle',
    'fb.eval': 'FORMULA.EVAL', 'fb.applied': '// applied per {p} · snapped to plate',
    'fb.perRound': '/ROUND',
    // Groups
    'group.big': 'Low Range', 'group.big.blurb': '1–5 reps · max strength',
    'group.medium': 'Mid Range', 'group.medium.blurb': '6–10 reps · hypertrophy',
    'group.small': 'High Range', 'group.small.blurb': '12+ reps · accessory',
    'group.cardio': 'Conditioning', 'group.cardio.blurb': 'Time · distance · GPP',
    // Equipment
    'equip.barbell': 'Barbell', 'equip.barbell.note': 'Pair of micros',
    'equip.dumbbell': 'Dumbbell', 'equip.dumbbell.note': 'Fixed-load rack',
    'equip.cable': 'Cable / Machine', 'equip.cable.note': 'Stack pin',
    'equip.bw': 'Weighted BW', 'equip.bw.note': 'Belt plates',
    // Day labels
    'day.heavyPush': 'Heavy Push', 'day.heavyPull': 'Heavy Pull',
    'day.legs': 'Legs', 'day.conditioning': 'Conditioning',
    // Exercises
    'ex.bench': 'Bench Press', 'ex.squat': 'Back Squat', 'ex.dead': 'Deadlift', 'ex.ohp': 'Overhead Press',
    'ex.row': 'Bent-over Row', 'ex.rdl': 'Romanian Deadlift', 'ex.incdb': 'Incline DB Press', 'ex.chin': 'Weighted Chin-up',
    'ex.curl': 'Barbell Curl', 'ex.tri': 'Tricep Pushdown', 'ex.lat': 'Lateral Raise', 'ex.face': 'Face Pull',
    'ex.sprint': 'Sled Sprints', 'ex.carry': 'Farmer Carry',
    // Short equipment tags
    'eq.barbell': 'barbell', 'eq.dumbbell': 'dumbbell', 'eq.cable': 'cable',
    'eq.machine': 'machine', 'eq.bw': 'bw+', 'eq.none': '—',
    // Stats
    'stats.sub': 'PROGRESS',
    'stats.sessions': 'Sessions logged', 'stats.tonnage': 'Total tonnage',
    'stats.projection': 'Projection', 'stats.peakAt': 'PEAK @ R{n}',
    'stats.logs': 'Logs', 'stats.recent': 'Recent', 'stats.r6proj': 'R{n} PROJECTION',
    'stats.longGame': 'Long Game', 'stats.yearMap': '{y} Map',
    'stats.yearGoal': '{y} {lift}',
    'stats.lift.bench': 'Bench', 'stats.lift.squat': 'Squat', 'stats.lift.dead': 'Dead',
    'stats.year.title': '{y} Long Game',
    'stats.year.sub': '{n} blocks · {r} rounds · projected',
    'stats.focus.strength': 'STRENGTH', 'stats.focus.hyper': 'HYPERTROPHY',
    'stats.focus.power': 'POWER', 'stats.focus.maintain': 'MAINTAIN',
    // Phase block names
    'phase.strength': 'Strength Block', 'phase.hyper': 'Hypertrophy Block',
    'phase.power': 'Power Block', 'phase.maintain': 'Maintenance Block',
    'phase.wave': 'Wave',
    // Active program name (default)
    'program.opName': 'Strength Block · Wave I',

    // Presets
    'preset.tag.novice': 'NOVICE', 'preset.tag.intermediate': 'INTERMEDIATE',
    'preset.tag.specialty': 'SPECIALTY', 'preset.tag.custom': 'CUSTOM',
    'preset.linear.name': 'Linear Novice', 'preset.linear.author': 'Generic',
    'preset.linear.year': '—', 'preset.linear.blurb': 'First strength block. +2.5 kg/round, 3×/wk.',
    'preset.rsr.name': 'Russian Squat Routine', 'preset.rsr.author': 'R. Plotkin',
    'preset.rsr.year': 'USSR · 1980s', 'preset.rsr.blurb': '6-week squat specialization. Wave-loaded.',
    'preset.rsr.dayA': 'Squat A', 'preset.rsr.dayB': 'Squat B', 'preset.rsr.dayC': 'Squat C',
    'preset.smolovBench.name': 'Smolov Jr. — Bench', 'preset.smolovBench.author': 'S. Smolov',
    'preset.smolovBench.year': 'USSR · 1990s', 'preset.smolovBench.blurb': '3-week bench peaking. 4×/wk brutal volume.',
    'preset.smolov.dayA': 'Bench A · 5×6', 'preset.smolov.dayB': 'Bench B · 5×5',
    'preset.smolov.dayC': 'Bench C · 5×4', 'preset.smolov.dayD': 'Bench D · 5×3',
    'preset.sheiko29.name': 'Sheiko #29', 'preset.sheiko29.author': 'B. Sheiko',
    'preset.sheiko29.year': 'Russia · 2000s', 'preset.sheiko29.blurb': 'Classic powerlifting volume. 4×/wk, all three lifts.',
    'preset.sheiko37.name': 'Sheiko #37', 'preset.sheiko37.author': 'B. Sheiko',
    'preset.sheiko37.year': 'Russia · 2000s', 'preset.sheiko37.blurb': 'Lighter Sheiko variant. Half-step progression.',
    'preset.sheiko.dayA': 'Sq + Bench', 'preset.sheiko.dayB': 'Bench focus',
    'preset.sheiko.dayC': 'Dead focus', 'preset.sheiko.dayD': 'Bench + Sq',
    'preset.custom.author': 'You', 'preset.custom.year': '2026',
    'preset.custom.blurb': 'Push / Pull / Legs / Conditioning split. 4×/wk, 6-round wave.',

    // Catalogue + run lifecycle
    'cat.title': 'Catalogue', 'cat.sub': 'PROGRAMS', 'cat.builtin': 'CLASSIC', 'cat.custom': 'YOURS',
    'cat.builtinTitle': 'Heavy athletics classics',
    'cat.new': 'New program', 'cat.goal': 'Build from goal',
    'cat.author': 'Author', 'cat.length': 'Length', 'cat.frequency': 'Frequency',
    'cat.structure': 'Structure', 'cat.start': 'Start program', 'cat.adopt': 'Adopt',
    'cat.alreadyActive': 'Currently active', 'cat.lastRun': 'Last run', 'cat.runs': 'Past runs',
    'cat.weeks': '{n} weeks', 'cat.daysWk': '{n}×/week',

    'run.status.active': 'ACTIVE', 'run.status.paused': 'PAUSED',
    'run.status.complete': 'COMPLETE', 'run.status.cancelled': 'ENDED',
    'run.pause': 'Pause', 'run.resume': 'Resume', 'run.end': 'End run',
    'run.completion': 'Completion',
    // Session controls
    'session.start': 'Start session', 'session.pause': 'Pause', 'session.resume': 'Resume',
    'session.finish': 'Finish', 'session.elapsed': 'elapsed',
    'session.confirmFinish.title': 'Finish session?',
    'session.confirmFinish.body': 'Logs your work and advances to the next day. You can\'t undo.',
    'session.confirmFinish.ok': 'Finish', 'session.confirmFinish.cancel': 'Keep going',
    'session.idle.hint': 'Tap to start the clock when you begin.',

    // Settings
    'set.title': 'Settings', 'set.sub': 'YOUR GYM',
    'set.section.app': 'App', 'set.section.gym': 'Your gym', 'set.section.about': 'About',
    'set.plateLib': 'Plate library', 'set.unit': 'Units', 'set.lang': 'Language',
    'set.version': 'Version', 'set.feedback': 'Send feedback',
    // Tweaks
    'tw.title': 'Settings',
    'tw.units': 'Units', 'tw.unitSystem': 'Unit system',
    'tw.language': 'Language', 'tw.languageSel': 'Interface',
    'tw.palette': 'Palette', 'tw.theme': 'Theme',
    'tw.typography': 'Typography', 'tw.typeface': 'Typeface',
    'tw.layout': 'Layout', 'tw.density': 'Density',
    'tw.compact': 'Compact', 'tw.comfy': 'Comfy',
    'tw.formula': 'Formula editor', 'tw.style': 'Style',
    'tw.preset': 'Preset', 'tw.blocks': 'Blocks', 'tw.code': 'Code',
    'tw.jump': 'Quick jump',
  },

  ru: {
    'brand.name': 'Молот',
    'brand.tagline': 'Молот · Программа тренировок · v0.0.0',
    'tab.today': 'Сегодня', 'tab.program': 'Программа', 'tab.forge': 'Кузница', 'tab.stats': 'Прогресс',
    'tab.active': 'Активная', 'tab.catalogue': 'Каталог', 'tab.settings': 'Настройки',
    'common.add': 'Добавить', 'common.edit': 'Изменить', 'common.use': 'Выбрать', 'common.day': 'День',
    'common.now': 'сейчас', 'common.deload': 'разгрузка', 'common.upcoming': 'впереди',
    'common.active': 'АКТИВНО', 'common.deloadCaps': 'РАЗГРУЗКА', 'common.auto': 'АВТО', 'common.beta': 'BETA',
    'common.round': 'ЦИКЛ', 'common.peak': 'ПИК',
    'common.min': 'мин', 'common.reps': 'повт', 'common.rest': 'Отдых', 'common.next': 'След',
    'common.rounds': 'Циклы', 'common.weeks': 'Недели', 'common.months': 'Месяцы',
    'common.start': 'Старт', 'common.step': 'Шаг/ц',
    'common.filter': 'Фильтр',

    'today.mission': 'Тренировка', 'today.exercises': 'Упражнения', 'today.sets': 'Подходы',
    'today.volume': 'Объём', 'today.est': 'Прим.',
    'today.adjust': 'Правка', 'today.finish.title': 'Завершить тренировку',
    'today.autoRest': 'Авто-отдых',
    'today.includeRest': 'С отдыхом', 'today.defaultRest': 'Отдых по умолч.',
    'common.startedAt': 'начато', 'common.sec': 'сек',
    'today.finish.sub': 'Запись · переход к Д{n}',
    'today.finish.cta': 'Готово',

    'program.active': 'ТЕКУЩИЙ БЛОК', 'program.templates': 'Шаблоны',
    'program.geometry': 'Геометрия блока',
    'program.geometryDesc': '{r} циклов × {d}д · {w} тренировок/цикл',
    'program.rounds': 'Циклы', 'program.daysPer': 'Дней / цикл',
    'program.workouts': 'Тренировок', 'program.deloadEvery': 'Разгрузка каждые',
    'program.cycleMap': 'Карта цикла', 'program.active.r': 'Ц{n} активен',
    'program.library': 'Библиотека', 'program.workoutDays': 'Тренировочные дни', 'program.perRound': 'В цикле',
    'program.restHint': '{n} дней отдыха в цикле, авто-распределение',
    'program.today': 'СЕГОДНЯ', 'program.exCount': '{n} УПР · {s} ПОДХ', 'program.more': '+ ещё {n}',

    'forge.engine': 'ПРОГРЕССИЯ', 'forge.title': 'Формулы',
    'forge.goal': 'Прогноз цели',
    'forge.lift': 'Упражнение', 'forge.target': 'Цель', 'forge.from': 'от',
    'forge.formulaNote': '// @ +{step} кг/цикл с разгрузкой каждые {n}',
    'forge.formulaGain': '// прирост/цикл = {n} кг',
    'forge.perGroup': 'По группам', 'forge.progression': 'Прогрессия',
    'forge.plateSnap': 'Шаг блина', 'forge.minStep': 'мин. шаг {n} (штанга)',
    'forge.plateLibrary': 'Библиотека снарядов',
    'forge.deloadProtocol': 'Протокол разгрузки',
    'forge.every': 'Каждые', 'forge.length': 'Длина', 'forge.intensity': 'Интенсив.',

    'fb.weight': 'вес', 'fb.prev': 'пред', 'fb.per': 'за',
    'fb.session': 'тренировку', 'fb.round': 'цикл', 'fb.cycle': 'блок',
    'fb.eval': 'ФОРМУЛА.ВЫЧИСЛЕНИЕ', 'fb.applied': '// применяется за {p} · округление до блина',
    'fb.perRound': '/ЦИКЛ',

    'group.big': 'Низкие повторы', 'group.big.blurb': '1–5 повт · макс. сила',
    'group.medium': 'Средние повторы', 'group.medium.blurb': '6–10 повт · гипертрофия',
    'group.small': 'Высокие повторы', 'group.small.blurb': '12+ повт · вспомогательные',
    'group.cardio': 'ОФП', 'group.cardio.blurb': 'Время · дистанция · ОФП',

    'equip.barbell': 'Штанга', 'equip.barbell.note': 'Пара мини-блинов',
    'equip.dumbbell': 'Гантели', 'equip.dumbbell.note': 'Фикс. набор',
    'equip.cable': 'Блок / Тренажёр', 'equip.cable.note': 'Штифт стека',
    'equip.bw': 'С весом', 'equip.bw.note': 'Блины к поясу',

    'day.heavyPush': 'Тяжёлый жим', 'day.heavyPull': 'Тяжёлая тяга',
    'day.legs': 'Ноги', 'day.conditioning': 'ОФП',

    'ex.bench': 'Жим лёжа', 'ex.squat': 'Приседания со штангой', 'ex.dead': 'Становая тяга', 'ex.ohp': 'Жим стоя',
    'ex.row': 'Тяга в наклоне', 'ex.rdl': 'Румынская тяга', 'ex.incdb': 'Жим гантелей на наклонной', 'ex.chin': 'Подтягивания с отягощением',
    'ex.curl': 'Подъём штанги на бицепс', 'ex.tri': 'Разгибание рук на блоке', 'ex.lat': 'Махи гантелями в стороны', 'ex.face': 'Тяга к лицу',
    'ex.sprint': 'Спринты с санями', 'ex.carry': 'Фермерская прогулка',

    'eq.barbell': 'штанга', 'eq.dumbbell': 'гантели', 'eq.cable': 'блок',
    'eq.machine': 'тренажёр', 'eq.bw': 'вес+', 'eq.none': '—',

    'stats.sub': 'ПРОГРЕСС',
    'stats.sessions': 'Тренировок', 'stats.tonnage': 'Общий тоннаж',
    'stats.projection': 'Прогноз', 'stats.peakAt': 'ПИК НА Ц{n}',
    'stats.logs': 'Журнал', 'stats.recent': 'Недавнее', 'stats.r6proj': 'ПРОГНОЗ Ц{n}',
    'stats.longGame': 'Долгая игра', 'stats.yearMap': 'Карта {y}',
    'stats.yearGoal': '{lift} {y}',
    'stats.lift.bench': 'Жим', 'stats.lift.squat': 'Присед', 'stats.lift.dead': 'Тяга',
    'stats.year.title': '{y} — Долгая игра',
    'stats.year.sub': '{n} блоков · {r} циклов · прогноз',
    'stats.focus.strength': 'СИЛА', 'stats.focus.hyper': 'ГИПЕРТРОФИЯ',
    'stats.focus.power': 'МОЩНОСТЬ', 'stats.focus.maintain': 'ПОДДЕРЖКА',
    'phase.strength': 'Силовой блок', 'phase.hyper': 'Объёмный блок',
    'phase.power': 'Блок мощности', 'phase.maintain': 'Поддерживающий блок',
    'phase.wave': 'Волна',
    'program.opName': 'Силовой блок · Волна I',

    'preset.tag.novice': 'НОВИЧОК', 'preset.tag.intermediate': 'СРЕДНИЙ',
    'preset.tag.specialty': 'СПЕЦИАЛЬНЫЙ', 'preset.tag.custom': 'СВОЙ',
    'preset.linear.name': 'Линейный для новичков', 'preset.linear.author': 'Общий',
    'preset.linear.year': '—', 'preset.linear.blurb': 'Первый силовой блок. +2.5 кг/цикл, 3×/нед.',
    'preset.rsr.name': 'Русский присед', 'preset.rsr.author': 'Р. Плоткин',
    'preset.rsr.year': 'СССР · 1980-е', 'preset.rsr.blurb': '6-недельная специализация на приседе. Волнообразная.',
    'preset.rsr.dayA': 'Присед А', 'preset.rsr.dayB': 'Присед Б', 'preset.rsr.dayC': 'Присед В',
    'preset.smolovBench.name': 'Смолов Мл. — Жим', 'preset.smolovBench.author': 'С. Смолов',
    'preset.smolovBench.year': 'Россия · 1990-е', 'preset.smolovBench.blurb': '3-недельная подводка жима. 4×/нед.',
    'preset.smolov.dayA': 'Жим А · 5×6', 'preset.smolov.dayB': 'Жим Б · 5×5',
    'preset.smolov.dayC': 'Жим В · 5×4', 'preset.smolov.dayD': 'Жим Г · 5×3',
    'preset.sheiko29.name': 'Шейко #29', 'preset.sheiko29.author': 'Б. Шейко',
    'preset.sheiko29.year': 'Россия · 2000-е', 'preset.sheiko29.blurb': 'Классика пауэрлифтинга. 4×/нед, все 3 движения.',
    'preset.sheiko37.name': 'Шейко #37', 'preset.sheiko37.author': 'Б. Шейко',
    'preset.sheiko37.year': 'Россия · 2000-е', 'preset.sheiko37.blurb': 'Облегчённый Шейко. Половинный шаг.',
    'preset.sheiko.dayA': 'Присед + Жим', 'preset.sheiko.dayB': 'Основа жим',
    'preset.sheiko.dayC': 'Основа тяга', 'preset.sheiko.dayD': 'Жим + Присед',
    'preset.custom.author': 'Вы', 'preset.custom.year': '2026',
    'preset.custom.blurb': 'Сплит Пуш / Пулл / Ноги / ОФП. 4×/нед, 6 циклов.',

    'cat.title': 'Каталог', 'cat.sub': 'ПРОГРАММЫ', 'cat.builtin': 'КЛАССИКА', 'cat.custom': 'СВОИ',
    'cat.builtinTitle': 'Классика тяжёлой атлетики',
    'cat.new': 'Новая программа', 'cat.goal': 'Строить по цели',
    'cat.author': 'Автор', 'cat.length': 'Длительн.', 'cat.frequency': 'Частота',
    'cat.structure': 'Структура', 'cat.start': 'Запустить', 'cat.adopt': 'Принять',
    'cat.alreadyActive': 'Активна', 'cat.lastRun': 'Прошлый запуск', 'cat.runs': 'Прошлые запуски',
    'cat.weeks': '{n} недель', 'cat.daysWk': '{n}×/нед',

    'run.status.active': 'АКТИВНА', 'run.status.paused': 'ПАУЗА',
    'run.status.complete': 'ЗАВЕРШЕНА', 'run.status.cancelled': 'ОСТАНОВЛЕНА',
    'run.pause': 'Пауза', 'run.resume': 'Продолжить', 'run.end': 'Завершить',
    'run.completion': 'Выполнение',
    'session.start': 'Начать', 'session.pause': 'Пауза', 'session.resume': 'Продолжить',
    'session.finish': 'Завершить', 'session.elapsed': 'прошло',
    'session.confirmFinish.title': 'Завершить тренировку?',
    'session.confirmFinish.body': 'Запишет результаты и перейдёт к следующему дню. Отменить нельзя.',
    'session.confirmFinish.ok': 'Завершить', 'session.confirmFinish.cancel': 'Продолжить',
    'session.idle.hint': 'Нажмите, чтобы запустить секундомер.',

    'set.title': 'Настройки', 'set.sub': 'ВАШ ЗАЛ',
    'set.section.app': 'Приложение', 'set.section.gym': 'Ваш зал', 'set.section.about': 'О программе',
    'set.plateLib': 'Снаряжение', 'set.unit': 'Единицы', 'set.lang': 'Язык',
    'set.version': 'Версия', 'set.feedback': 'Отправить отзыв',

    'tw.title': 'Настройки',
    'tw.units': 'Единицы', 'tw.unitSystem': 'Система',
    'tw.language': 'Язык', 'tw.languageSel': 'Интерфейс',
    'tw.palette': 'Палитра', 'tw.theme': 'Тема',
    'tw.typography': 'Типографика', 'tw.typeface': 'Шрифт',
    'tw.layout': 'Раскладка', 'tw.density': 'Плотность',
    'tw.compact': 'Плотно', 'tw.comfy': 'Свободно',
    'tw.formula': 'Редактор формул', 'tw.style': 'Стиль',
    'tw.preset': 'Пресет', 'tw.blocks': 'Блоки', 'tw.code': 'Код',
    'tw.jump': 'Переход',
  },

  zh: {
    'brand.name': '铁锤',
    'brand.tagline': '铁锤 · 训练规划 · v0.0.0',
    'tab.today': '今日', 'tab.program': '计划', 'tab.forge': '熔炉', 'tab.stats': '进度',
    'tab.active': '进行中', 'tab.catalogue': '计划库', 'tab.settings': '设置',
    'common.add': '添加', 'common.edit': '编辑', 'common.use': '使用', 'common.day': '日',
    'common.now': '当前', 'common.deload': '减载', 'common.upcoming': '将至',
    'common.active': '进行中', 'common.deloadCaps': '减载', 'common.auto': '自动', 'common.beta': 'BETA',
    'common.round': '周期', 'common.peak': '峰值',
    'common.min': '分', 'common.reps': '次', 'common.rest': '间歇', 'common.next': '下一步',
    'common.rounds': '周期', 'common.weeks': '周', 'common.months': '月',
    'common.start': '起始', 'common.step': '步/期',
    'common.filter': '筛选',

    'today.mission': '今日训练', 'today.exercises': '动作', 'today.sets': '组数',
    'today.volume': '总量', 'today.est': '估时',
    'today.adjust': '调整', 'today.finish.title': '完成训练',
    'today.autoRest': '自动间歇倒计时',
    'today.includeRest': '含间歇', 'today.defaultRest': '默认间歇',
    'common.startedAt': '开始于', 'common.sec': '秒',
    'today.finish.sub': '锁定记录 · 推进至 D{n}',
    'today.finish.cta': '完成',

    'program.active': '当前块', 'program.templates': '模板',
    'program.geometry': '块结构',
    'program.geometryDesc': '{r} 周期 × {d} 日 · {w} 训练/周期',
    'program.rounds': '周期数', 'program.daysPer': '每周期日数',
    'program.workouts': '训练日', 'program.deloadEvery': '减载频率',
    'program.cycleMap': '周期图', 'program.active.r': '当前 R{n}',
    'program.library': '库', 'program.workoutDays': '训练日', 'program.perRound': '每周期',
    'program.restHint': '每周期 {n} 个休息日 · 自动分配',
    'program.today': '今日', 'program.exCount': '{n} 动作 · {s} 组', 'program.more': '+ 另 {n} 项',

    'forge.engine': '进阶', 'forge.title': '公式',
    'forge.goal': '目标推演',
    'forge.lift': '动作', 'forge.target': '目标', 'forge.from': '起于',
    'forge.formulaNote': '// @ +{step} 公斤/周期 · 每 {n} 周期减载',
    'forge.formulaGain': '// 每块增益 = {n} 公斤',
    'forge.perGroup': '按组别', 'forge.progression': '进阶',
    'forge.plateSnap': '配片对齐', 'forge.minStep': '最小步进 {n}（杠铃）',
    'forge.plateLibrary': '配片库',
    'forge.deloadProtocol': '减载方案',
    'forge.every': '间隔', 'forge.length': '长度', 'forge.intensity': '强度',

    'fb.weight': '重量', 'fb.prev': '上次', 'fb.per': '按',
    'fb.session': '次', 'fb.round': '周期', 'fb.cycle': '块',
    'fb.eval': '公式·运算', 'fb.applied': '// 按{p}应用 · 自动对齐配片',
    'fb.perRound': '/周期',

    'group.big': '低次数', 'group.big.blurb': '1–5 次 · 最大力量',
    'group.medium': '中次数', 'group.medium.blurb': '6–10 次 · 增肌',
    'group.small': '高次数', 'group.small.blurb': '12+ 次 · 辅助',
    'group.cardio': '体能', 'group.cardio.blurb': '时间 · 距离 · 基础体能',

    'equip.barbell': '杠铃', 'equip.barbell.note': '微型片一对',
    'equip.dumbbell': '哑铃', 'equip.dumbbell.note': '固定档位',
    'equip.cable': '拉索 / 器械', 'equip.cable.note': '配重栓',
    'equip.bw': '负重自重', 'equip.bw.note': '腰带挂片',

    'day.heavyPush': '重推', 'day.heavyPull': '重拉',
    'day.legs': '腿', 'day.conditioning': '体能',

    'ex.bench': '卧推', 'ex.squat': '深蹲', 'ex.dead': '硬拉', 'ex.ohp': '站姿推举',
    'ex.row': '仰身划船', 'ex.rdl': '罗马尼亚硬拉', 'ex.incdb': '上斜哑铃推举', 'ex.chin': '负重引体向上',
    'ex.curl': '杠铃弯举', 'ex.tri': '三头下压', 'ex.lat': '侧平举', 'ex.face': '面拉',
    'ex.sprint': '雪橇冲刺', 'ex.carry': '农夫行走',

    'eq.barbell': '杠铃', 'eq.dumbbell': '哑铃', 'eq.cable': '拉索',
    'eq.machine': '器械', 'eq.bw': '负重', 'eq.none': '—',

    'stats.sub': '进度',
    'stats.sessions': '已完成训练', 'stats.tonnage': '总吨位',
    'stats.projection': '推演', 'stats.peakAt': '峰值 @ R{n}',
    'stats.logs': '记录', 'stats.recent': '近期', 'stats.r6proj': 'R{n} 推演',
    'stats.longGame': '长线', 'stats.yearMap': '{y} 图谱',
    'stats.yearGoal': '{y} {lift}',
    'stats.lift.bench': '卧推', 'stats.lift.squat': '深蹲', 'stats.lift.dead': '硬拉',
    'stats.year.title': '{y} 长线计划',
    'stats.year.sub': '{n} 个块 · {r} 周期 · 推演',
    'stats.focus.strength': '力量', 'stats.focus.hyper': '增肌',
    'stats.focus.power': '爆发', 'stats.focus.maintain': '维持',
    'phase.strength': '力量阶段', 'phase.hyper': '增肌阶段',
    'phase.power': '爆发阶段', 'phase.maintain': '维持阶段',
    'phase.wave': '波',
    'program.opName': '力量阶段 · 第一波',

    'preset.tag.novice': '初阶', 'preset.tag.intermediate': '中阶',
    'preset.tag.specialty': '专项', 'preset.tag.custom': '自定义',
    'preset.linear.name': '线性初阶', 'preset.linear.author': '通用',
    'preset.linear.year': '—', 'preset.linear.blurb': '首个力量块。每周期 +2.5 公斤，每周 3 次。',
    'preset.rsr.name': '俄罗斯深蹲计划', 'preset.rsr.author': '普洛特金',
    'preset.rsr.year': '苏联 · 1980年代', 'preset.rsr.blurb': '6 周深蹲专项。波浪式负荷。',
    'preset.rsr.dayA': '深蹲 A', 'preset.rsr.dayB': '深蹲 B', 'preset.rsr.dayC': '深蹲 C',
    'preset.smolovBench.name': '斯莫洛夫初级 · 卧推', 'preset.smolovBench.author': '斯莫洛夫',
    'preset.smolovBench.year': '俄罗斯 · 1990年代', 'preset.smolovBench.blurb': '3 周卧推冲顶。每周 4 次高量。',
    'preset.smolov.dayA': '卧推 A · 5×6', 'preset.smolov.dayB': '卧推 B · 5×5',
    'preset.smolov.dayC': '卧推 C · 5×4', 'preset.smolov.dayD': '卧推 D · 5×3',
    'preset.sheiko29.name': '谢伊科 #29', 'preset.sheiko29.author': '谢伊科',
    'preset.sheiko29.year': '俄罗斯 · 2000年代', 'preset.sheiko29.blurb': '经典举重高量计划。每周 4 次，三项必修。',
    'preset.sheiko37.name': '谢伊科 #37', 'preset.sheiko37.author': '谢伊科',
    'preset.sheiko37.year': '俄罗斯 · 2000年代', 'preset.sheiko37.blurb': '轻量版 Sheiko。半步进阶。',
    'preset.sheiko.dayA': '深蹲 + 卧推', 'preset.sheiko.dayB': '卧推为主',
    'preset.sheiko.dayC': '硬拉为主', 'preset.sheiko.dayD': '卧推 + 深蹲',
    'preset.custom.author': '你', 'preset.custom.year': '2026',
    'preset.custom.blurb': '推 / 拉 / 腿 / 体能分化。每周 4 次，6 周期波动。',

    'cat.title': '计划库', 'cat.sub': '计划', 'cat.builtin': '经典', 'cat.custom': '自定义',
    'cat.builtinTitle': '重竞技经典',
    'cat.new': '新建计划', 'cat.goal': '按目标建立',
    'cat.author': '作者', 'cat.length': '时长', 'cat.frequency': '频率',
    'cat.structure': '结构', 'cat.start': '启动计划', 'cat.adopt': '采用',
    'cat.alreadyActive': '当前进行中', 'cat.lastRun': '上次运行', 'cat.runs': '历史运行',
    'cat.weeks': '{n} 周', 'cat.daysWk': '每周 {n} 次',

    'run.status.active': '进行中', 'run.status.paused': '暂停',
    'run.status.complete': '已完成', 'run.status.cancelled': '已结束',
    'run.pause': '暂停', 'run.resume': '继续', 'run.end': '结束',
    'run.completion': '完成度',
    'session.start': '开始训练', 'session.pause': '暂停', 'session.resume': '继续',
    'session.finish': '完成', 'session.elapsed': '耗时',
    'session.confirmFinish.title': '完成本次训练？',
    'session.confirmFinish.body': '记录今日表现并推进到下一天。不可撤销。',
    'session.confirmFinish.ok': '完成', 'session.confirmFinish.cancel': '继续',
    'session.idle.hint': '按一下启动计时器。',

    'set.title': '设置', 'set.sub': '你的健身房',
    'set.section.app': '应用', 'set.section.gym': '你的健身房', 'set.section.about': '关于',
    'set.plateLib': '配片库', 'set.unit': '单位', 'set.lang': '语言',
    'set.version': '版本', 'set.feedback': '反馈',

    'tw.title': '设置',
    'tw.units': '单位', 'tw.unitSystem': '系统',
    'tw.language': '语言', 'tw.languageSel': '界面',
    'tw.palette': '调色板', 'tw.theme': '主题',
    'tw.typography': '字体', 'tw.typeface': '字体',
    'tw.layout': '布局', 'tw.density': '密度',
    'tw.compact': '紧凑', 'tw.comfy': '舒适',
    'tw.formula': '公式编辑器', 'tw.style': '样式',
    'tw.preset': '预设', 'tw.blocks': '块', 'tw.code': '代码',
    'tw.jump': '快速跳转',
  },
};

Object.assign(window, { LANGS, STRINGS });

// ── Context + hook ──────────────────────────────────────────────────────────
const LangCtx = React.createContext('ru');

// useT() → a `T(key, vars)` function bound to the active language.
// vars: {n: 3} replaces {n} in the string.
function useT() {
  const lang = React.useContext(LangCtx);
  return React.useCallback((key, vars) => {
    const table = STRINGS[lang] || STRINGS.en;
    let s = table[key];
    if (s == null) s = STRINGS.en[key];
    if (s == null) s = key;
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
      }
    }
    return s;
  }, [lang]);
}

Object.assign(window, { LangCtx, useT });
