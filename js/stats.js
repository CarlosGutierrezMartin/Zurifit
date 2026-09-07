// Cálculos derivados: récords, progresión, rachas, recuerdos y nivel.
// Nada de esto se guarda: se recalcula a partir de las sesiones.

import { getState, weekKey, programWeek, parseISO, todayISO } from './store.js';
import { EXERCISES } from './data/exercises.js';
import { PROGRAM, weeklyCardioGoal } from './data/program.js';
import { LEVELS } from './data/messages.js';

export const isTime = id => EXERCISES[id]?.unit === 'time';
export const isWeighted = id => !EXERCISES[id]?.noWeight;
const sideFactor = id => (EXERCISES[id]?.perSide ? 2 : 1);

export function setVolume(exerciseId, set) {
  if (!set || !set.done) return 0;
  if (!isWeighted(exerciseId) || isTime(exerciseId)) return 0;
  return (Number(set.w) || 0) * (Number(set.r) || 0) * sideFactor(exerciseId);
}

export function exerciseVolume(exerciseId, sets = []) {
  return sets.reduce((t, s) => t + setVolume(exerciseId, s), 0);
}

export function sessionVolume(session) {
  return (session.exercises || []).reduce(
    (t, e) => t + exerciseVolume(e.id, e.sets), 0);
}

export function sessionReps(session) {
  return (session.exercises || []).reduce((t, e) => t + e.sets.reduce(
    (n, s) => n + (s.done && !isTime(e.id) ? (Number(s.r) || 0) * sideFactor(e.id) : 0), 0), 0);
}

export function doneSets(session) {
  return (session.exercises || []).reduce(
    (t, e) => t + e.sets.filter(s => s.done).length, 0);
}

export function plannedSets(session) {
  return (session.exercises || []).reduce((t, e) => t + e.sets.length, 0);
}

export function estimate1RM(w, r) {
  if (!w || !r) return 0;
  return w * (1 + r / 30);          // fórmula de Epley
}

// -------------------------------------------------------------- historial ---

// Todas las veces que ha hecho un ejercicio, de la más antigua a la más nueva.
export function historyFor(exerciseId) {
  const out = [];
  for (const s of getState().sessions) {
    const e = (s.exercises || []).find(x => x.id === exerciseId);
    if (!e) continue;
    const done = e.sets.filter(x => x.done);
    if (!done.length) continue;
    const topWeight = Math.max(...done.map(x => Number(x.w) || 0));
    const bestSet = done.reduce((best, x) => {
      const score = isTime(exerciseId)
        ? (Number(x.r) || 0)
        : estimate1RM(Number(x.w) || 0, Number(x.r) || 0) || (Number(x.r) || 0);
      return !best || score > best.score ? { score, w: Number(x.w) || 0, r: Number(x.r) || 0 } : best;
    }, null);
    out.push({
      sessionId: s.id,
      date: s.date,
      topWeight,
      bestSet,
      maxReps: Math.max(...done.map(x => Number(x.r) || 0)),
      volume: exerciseVolume(exerciseId, e.sets),
      sets: done.map(x => ({ w: Number(x.w) || 0, r: Number(x.r) || 0, rir: x.rir })),
      note: e.note || ''
    });
  }
  return out;
}

export function lastPerformance(exerciseId) {
  const h = historyFor(exerciseId);
  return h.length ? h[h.length - 1] : null;
}

// Mejores marcas históricas de un ejercicio.
export function recordsFor(exerciseId) {
  const h = historyFor(exerciseId);
  if (!h.length) return null;
  const rec = { topWeight: 0, repsAtTop: 0, maxReps: 0, bestVolume: 0, best1rm: 0, date: null };
  for (const entry of h) {
    if (entry.topWeight > rec.topWeight) { rec.topWeight = entry.topWeight; rec.repsAtTop = 0; }
    for (const st of entry.sets) {
      if (st.w === rec.topWeight && st.r > rec.repsAtTop) rec.repsAtTop = st.r;
      const e1 = estimate1RM(st.w, st.r);
      if (e1 > rec.best1rm) { rec.best1rm = e1; rec.date = entry.date; }
    }
    if (entry.maxReps > rec.maxReps) rec.maxReps = entry.maxReps;
    if (entry.volume > rec.bestVolume) rec.bestVolume = entry.volume;
  }
  return rec;
}

export function allRecords() {
  const out = [];
  for (const id of Object.keys(EXERCISES)) {
    const r = recordsFor(id);
    if (r) out.push({ id, ...r, sessions: historyFor(id).length });
  }
  return out.sort((a, b) => b.topWeight - a.topWeight);
}

// -------------------------------------------------------------- récords ---

// Compara una serie recién marcada contra el mejor histórico + lo ya hecho
// en la sesión actual. Devuelve el récord batido, o null.
export function checkPR(exerciseId, set, baseline, sessionBest) {
  if (!set.done) return null;
  const w = Number(set.w) || 0;
  const r = Number(set.r) || 0;
  if (!r) return null;

  const best = {
    topWeight: Math.max(baseline?.topWeight || 0, sessionBest?.topWeight || 0),
    repsAtTop: Math.max(baseline?.repsAtTop || 0, sessionBest?.repsAtTop || 0),
    maxReps: Math.max(baseline?.maxReps || 0, sessionBest?.maxReps || 0)
  };

  // Sin peso o por tiempo: el récord es de repeticiones/segundos.
  if (!isWeighted(exerciseId)) {
    if (r > best.maxReps && best.maxReps > 0) {
      return { kind: isTime(exerciseId) ? 'tiempo' : 'reps', value: r, previous: best.maxReps };
    }
    return null;
  }
  if (w > best.topWeight && best.topWeight > 0) {
    return { kind: 'peso', value: w, previous: best.topWeight };
  }
  if (w === best.topWeight && w > 0 && r > best.repsAtTop && best.repsAtTop > 0) {
    return { kind: 'reps', value: r, weight: w, previous: best.repsAtTop };
  }
  return null;
}

export function prLabel(exerciseId, pr) {
  const name = EXERCISES[exerciseId]?.short || exerciseId;
  if (pr.kind === 'peso')   return `${name}: ${fmtKg(pr.value)} kg (antes ${fmtKg(pr.previous)} kg)`;
  if (pr.kind === 'tiempo') return `${name}: ${pr.value} s (antes ${pr.previous} s)`;
  if (pr.weight)            return `${name}: ${pr.value} reps con ${fmtKg(pr.weight)} kg`;
  return `${name}: ${pr.value} repeticiones`;
}

// ------------------------------------------------- sugerencia de progresión ---

// Regla del PDF: si completa el tope del rango en todas las series, sube peso.
export function suggestion(exerciseId, progEx, week) {
  const last = lastPerformance(exerciseId);
  const ex = EXERCISES[exerciseId];
  if (!last) {
    return { weight: null, reps: progEx.reps[0], level: 'nuevo',
      text: 'Primera vez: elige un peso que te deje 2-3 repeticiones de margen.' };
  }
  const top = progEx.reps[1];
  const expected = week <= 2 ? Math.min(progEx.sets, 2) : progEx.sets;
  const setsAtTop = last.sets.filter(s => s.r >= top).length;
  const sameWeight = last.sets.every(s => s.w === last.topWeight);
  const enoughSets = last.sets.length >= Math.min(expected, 2);
  const easy = last.sets.every(s => (s.rir === undefined || s.rir === null || s.rir >= 2));

  if (!isWeighted(exerciseId)) {
    const reps = Math.max(...last.sets.map(s => s.r));
    if (reps >= top) {
      return { weight: null, reps: top, level: 'sube',
        text: `La última vez llegaste a ${reps}${isTime(exerciseId) ? ' s' : ' reps'}. Aguanta un poquito más hoy.` };
    }
    return { weight: null, reps, level: 'mantén',
      text: `La última vez: ${last.sets.map(s => s.r).join(', ')}${isTime(exerciseId) ? ' s' : ' reps'}.` };
  }

  if (setsAtTop >= expected && sameWeight && enoughSets && easy) {
    const next = last.topWeight + (ex.step || 2.5);
    return { weight: next, reps: progEx.reps[0], level: 'sube',
      text: `¡Toca subir! Completaste ${top} repeticiones en todas las series con ${fmtKg(last.topWeight)} kg.` };
  }
  return { weight: last.topWeight, reps: Math.min(top, (Math.max(...last.sets.map(s => s.r)) || progEx.reps[0]) + 1),
    level: 'mantén',
    text: `Última vez: ${last.sets.map(s => `${s.r}`).join(', ')} reps con ${fmtKg(last.topWeight)} kg. Intenta sumar alguna repetición.` };
}

// ----------------------------------------------------------- por semanas ---

export function weeklySummary() {
  const map = new Map();
  for (const s of getState().sessions) {
    const k = weekKey(s.date);
    if (!map.has(k)) map.set(k, { week: k, sessions: 0, volume: 0, cardio: 0, minutes: 0, days: new Set(), prs: 0 });
    const w = map.get(k);
    w.sessions += 1;
    w.volume += s.volume || sessionVolume(s);
    w.cardio += s.cardio?.minutes || 0;
    w.minutes += Math.round((s.durationSec || 0) / 60);
    w.days.add(s.dayId);
    w.prs += (s.prs || []).length;
  }
  return [...map.values()]
    .sort((a, b) => a.week.localeCompare(b.week))
    .map(w => ({ ...w, distinctDays: w.days.size, goal: weeklyCardioGoal(programWeek(w.week)) }));
}

export function currentWeekSummary() {
  const k = weekKey(todayISO());
  return weeklySummary().find(w => w.week === k)
    || { week: k, sessions: 0, volume: 0, cardio: 0, minutes: 0, distinctDays: 0, prs: 0, goal: weeklyCardioGoal(programWeek()) };
}

function streaks(weeks) {
  // Semanas consecutivas (naturales) con 3 o más entrenos.
  const good = weeks.filter(w => w.sessions >= 3).map(w => w.week);
  if (!good.length) return { best: 0, current: 0 };
  let best = 1, run = 1;
  for (let i = 1; i < good.length; i++) {
    const prev = parseISO(good[i - 1]), cur = parseISO(good[i]);
    run = Math.round((cur - prev) / 86400000) === 7 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const thisWeek = weekKey(todayISO());
  const lastGood = good[good.length - 1];
  const gap = Math.round((parseISO(thisWeek) - parseISO(lastGood)) / 86400000);
  const current = gap <= 7 ? run : 0;   // se mantiene si la racha llega a esta semana o la pasada
  return { best, current };
}

// ------------------------------------------------- estadísticas globales ---

export function globalStats() {
  const sessions = getState().sessions;
  const weeks = weeklySummary();
  const st = streaks(weeks);
  let comebacks = 0;
  for (let i = 1; i < sessions.length; i++) {
    const gap = (parseISO(sessions[i].date) - parseISO(sessions[i - 1].date)) / 86400000;
    if (gap > 8) comebacks++;
  }
  const totalVolume = sessions.reduce((t, s) => t + (s.volume || sessionVolume(s)), 0);
  const totalCardio = sessions.reduce((t, s) => t + (s.cardio?.minutes || 0), 0);
  const totalMinutes = sessions.reduce((t, s) => t + Math.round((s.durationSec || 0) / 60), 0);
  const totalPRs = sessions.reduce((t, s) => t + (s.prs?.length || 0), 0);

  const stats = {
    totalSessions: sessions.length,
    totalVolume,
    totalCardio,
    totalMinutes,
    totalPRs,
    distinctDays: new Set(sessions.map(s => s.dayId)).size,
    fullWeeks: weeks.filter(w => w.distinctDays >= 4).length,
    bestStreak: st.best,
    currentStreak: st.current,
    cardioGoalWeeks: weeks.filter(w => w.cardio >= w.goal[0]).length,
    earlyBird: sessions.filter(s => new Date(s.startedAt).getHours() < 8).length,
    nightOwl: sessions.filter(s => new Date(s.startedAt).getHours() >= 21).length,
    comebacks,
    weeks
  };
  stats.xp = Math.round(stats.totalSessions * 120 + stats.totalPRs * 60
    + stats.totalVolume / 200 + stats.totalCardio * 2);
  stats.level = levelFor(stats.xp);
  return stats;
}

export function levelFor(xp) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.min) idx = i; });
  const cur = LEVELS[idx], next = LEVELS[idx + 1] || null;
  return {
    index: idx + 1,
    name: cur.name,
    emoji: cur.emoji,
    xp,
    floor: cur.min,
    next: next ? next.min : null,
    nextName: next ? next.name : null,
    pct: next ? Math.min(100, ((xp - cur.min) / (next.min - cur.min)) * 100) : 100
  };
}

// -------------------------------------------------------------- recuerdos ---

// "Hace 21 días hacías prensa con 30 kg. Hoy vas por 45 kg."
export function memories(limit = 3) {
  const out = [];
  for (const id of Object.keys(EXERCISES)) {
    const h = historyFor(id);
    if (h.length < 2) continue;
    const latest = h[h.length - 1];
    const old = [...h.slice(0, -1)].reverse().find(e => {
      const days = (parseISO(latest.date) - parseISO(e.date)) / 86400000;
      return days >= 10;
    }) || h[0];
    if (old === latest) continue;
    const days = Math.round((parseISO(todayISO()) - parseISO(old.date)) / 86400000);
    if (days < 10) continue;
    const name = EXERCISES[id].short;
    if (isWeighted(id) && latest.topWeight > old.topWeight) {
      out.push({ id, days, delta: latest.topWeight - old.topWeight, kind: 'peso',
        text: `Hace ${days} días hacías <b>${name}</b> con ${fmtKg(old.topWeight)} kg. Hoy vas por <b>${fmtKg(latest.topWeight)} kg</b>.`,
        badge: `+${fmtKg(latest.topWeight - old.topWeight)} kg` });
    } else if (!isWeighted(id) && latest.maxReps > old.maxReps) {
      const u = isTime(id) ? 's' : 'reps';
      out.push({ id, days, delta: latest.maxReps - old.maxReps, kind: 'reps',
        text: `Hace ${days} días aguantabas <b>${name}</b> ${old.maxReps} ${u}. Ahora llegas a <b>${latest.maxReps} ${u}</b>.`,
        badge: `+${latest.maxReps} ${u}` });
    } else if (latest.volume > old.volume * 1.1) {
      out.push({ id, days, delta: latest.volume - old.volume, kind: 'volumen',
        text: `Hace ${days} días movías ${fmtKg(old.volume)} kg en total en <b>${name}</b>. La última vez, <b>${fmtKg(latest.volume)} kg</b>.`,
        badge: `+${Math.round(((latest.volume / old.volume) - 1) * 100)}%` });
    }
  }
  return out.sort((a, b) => b.delta - a.delta).slice(0, limit);
}

// --------------------------------------------------------- día sugerido ---

// El siguiente día del programa que le falta esta semana (sin obligar a nada).
export function suggestedDay() {
  const k = weekKey(todayISO());
  const doneThisWeek = getState().sessions.filter(s => weekKey(s.date) === k).map(s => s.dayId);
  const pending = PROGRAM.find(d => !doneThisWeek.includes(d.id));
  if (pending) return pending;
  const last = getState().sessions[getState().sessions.length - 1];
  const idx = PROGRAM.findIndex(d => d.id === last?.dayId);
  return PROGRAM[(idx + 1) % PROGRAM.length];
}

// ------------------------------------------------------------- formato ---

export function fmtKg(n) {
  const v = Math.round((Number(n) || 0) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');
}

export function fmtBig(n) {
  return Math.round(Number(n) || 0).toLocaleString('es-ES');
}

export function fmtDate(iso) {
  return parseISO(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function fmtDateLong(iso) {
  return parseISO(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function fmtDuration(sec) {
  if ((sec || 0) < 60) return `${Math.round(sec || 0)} s`;
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
