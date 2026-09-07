// Logros. Cada uno tiene un objetivo numérico, así que la app puede
// mostrar barra de progreso incluso antes de desbloquearlo.

export const ACHIEVEMENTS = [
  // --- Constancia ---
  { id: 'primer-dia',   cat: 'Constancia', emoji: '🎀', name: 'El primer día',        desc: 'Completar tu primer entrenamiento.',            target: 1,   value: s => s.totalSessions },
  { id: 'cinco',        cat: 'Constancia', emoji: '🌸', name: 'Ya no es casualidad',  desc: 'Completar 5 entrenamientos.',                   target: 5,   value: s => s.totalSessions },
  { id: 'diez',         cat: 'Constancia', emoji: '🌻', name: 'Diez de diez',         desc: 'Completar 10 entrenamientos.',                  target: 10,  value: s => s.totalSessions },
  { id: 'veinticinco',  cat: 'Constancia', emoji: '🏵️', name: 'Veinticinco',          desc: 'Completar 25 entrenamientos.',                  target: 25,  value: s => s.totalSessions },
  { id: 'cincuenta',    cat: 'Constancia', emoji: '🏆', name: 'Media centena',        desc: 'Completar 50 entrenamientos.',                  target: 50,  value: s => s.totalSessions },
  { id: 'cien',         cat: 'Constancia', emoji: '👑', name: 'Cien sesiones',        desc: 'Completar 100 entrenamientos.',                 target: 100, value: s => s.totalSessions },
  { id: 'los-cuatro',   cat: 'Constancia', emoji: '🗺️', name: 'Los cuatro días',      desc: 'Probar los 4 días de la rutina al menos una vez.', target: 4, value: s => s.distinctDays },
  { id: 'semana-full',  cat: 'Constancia', emoji: '📅', name: 'Semana redonda',       desc: 'Hacer los 4 días en una misma semana.',         target: 1,   value: s => s.fullWeeks },
  { id: 'mes-full',     cat: 'Constancia', emoji: '🗓️', name: 'Mes redondo',          desc: 'Completar 4 semanas con los 4 días.',           target: 4,   value: s => s.fullWeeks },
  { id: 'racha-2',      cat: 'Constancia', emoji: '✨', name: 'Dos seguidas',         desc: '2 semanas seguidas entrenando (3 días o más).', target: 2,   value: s => s.bestStreak },
  { id: 'racha-4',      cat: 'Constancia', emoji: '🔥', name: 'Un mes sin fallar',    desc: '4 semanas seguidas entrenando.',                target: 4,   value: s => s.bestStreak },
  { id: 'racha-8',      cat: 'Constancia', emoji: '💫', name: 'Dos meses de racha',   desc: '8 semanas seguidas entrenando.',                target: 8,   value: s => s.bestStreak },
  { id: 'racha-12',     cat: 'Constancia', emoji: '🌟', name: 'Trimestre perfecto',   desc: '12 semanas seguidas entrenando.',               target: 12,  value: s => s.bestStreak },

  // --- Fuerza ---
  { id: 'primer-pr',    cat: 'Fuerza',     emoji: '🥇', name: 'Tu primer récord',     desc: 'Batir tu primera marca personal.',              target: 1,   value: s => s.totalPRs },
  { id: 'diez-pr',      cat: 'Fuerza',     emoji: '📈', name: 'Subiendo',             desc: 'Batir 10 marcas personales.',                   target: 10,  value: s => s.totalPRs },
  { id: 'cincuenta-pr', cat: 'Fuerza',     emoji: '🚀', name: 'Otra liga',            desc: 'Batir 50 marcas personales.',                   target: 50,  value: s => s.totalPRs },
  { id: 'vol-10k',      cat: 'Fuerza',     emoji: '🪨', name: '10.000 kg',            desc: 'Acumular 10 toneladas de peso movido.',         target: 10000,  value: s => s.totalVolume },
  { id: 'vol-50k',      cat: 'Fuerza',     emoji: '🐘', name: '50.000 kg',            desc: 'Acumular 50 toneladas de peso movido.',         target: 50000,  value: s => s.totalVolume },
  { id: 'vol-250k',     cat: 'Fuerza',     emoji: '🏔️', name: '250.000 kg',           desc: 'Acumular 250 toneladas de peso movido.',        target: 250000, value: s => s.totalVolume },

  // --- Cardio ---
  { id: 'cardio-100',   cat: 'Cardio',     emoji: '👟', name: '100 minutos',          desc: 'Acumular 100 minutos de cardio.',               target: 100,  value: s => s.totalCardio },
  { id: 'cardio-500',   cat: 'Cardio',     emoji: '🚴', name: '500 minutos',          desc: 'Acumular 500 minutos de cardio.',               target: 500,  value: s => s.totalCardio },
  { id: 'cardio-1000',  cat: 'Cardio',     emoji: '🏔️', name: 'Mil minutos',          desc: 'Acumular 1.000 minutos de cardio.',             target: 1000, value: s => s.totalCardio },
  { id: 'cardio-meta',  cat: 'Cardio',     emoji: '🎯', name: 'Objetivo cumplido',    desc: 'Llegar al objetivo semanal de cardio.',         target: 1,    value: s => s.cardioGoalWeeks },
  { id: 'cardio-meta4', cat: 'Cardio',     emoji: '🎯', name: 'Cuatro dianas',        desc: 'Llegar al objetivo semanal de cardio 4 semanas.', target: 4,  value: s => s.cardioGoalWeeks },

  // --- Especiales ---
  { id: 'madrugadora',  cat: 'Especiales', emoji: '🌅', name: 'Madrugadora',          desc: 'Entrenar antes de las 8:00.',                   target: 1,   value: s => s.earlyBird },
  { id: 'nocturna',     cat: 'Especiales', emoji: '🌙', name: 'Búho de gimnasio',     desc: 'Entrenar después de las 21:00.',                target: 1,   value: s => s.nightOwl },
  { id: 'horas-10',     cat: 'Especiales', emoji: '⏱️', name: '10 horas',             desc: 'Acumular 10 horas de entrenamiento.',           target: 600, value: s => s.totalMinutes },
  { id: 'horas-30',     cat: 'Especiales', emoji: '⌛', name: '30 horas',             desc: 'Acumular 30 horas de entrenamiento.',           target: 1800, value: s => s.totalMinutes },
  { id: 'vuelta',       cat: 'Especiales', emoji: '💗', name: 'Volver siempre',       desc: 'Retomar después de más de una semana de pausa.', target: 1,  value: s => s.comebacks }
];

export const CATEGORIES = ['Constancia', 'Fuerza', 'Cardio', 'Especiales'];

export function evaluate(stats) {
  return ACHIEVEMENTS.map(a => {
    const v = a.value(stats) || 0;
    return { ...a, current: v, unlocked: v >= a.target, pct: Math.min(100, (v / a.target) * 100) };
  });
}
