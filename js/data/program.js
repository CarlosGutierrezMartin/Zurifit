// Los 4 días de la rutina, tal y como aparecen en el PDF.
//
// sets: series desde la semana 3. Durante las semanas 1 y 2 se hacen
//       solo 2 series de cada ejercicio (regla del PDF).
// reps: [mínimo, máximo] del rango objetivo. Para ejercicios de tiempo,
//       son segundos.
// rest: segundos de descanso.
// cardio.w12 / cardio.w3: [min, max] minutos según la semana.

export const PROGRAM = [
  {
    id: 'dia1',
    number: 1,
    title: 'Glúteo + cuádriceps + core',
    focus: 'Piernas y abdomen',
    emoji: '🍑',
    duration: '60-75 min',
    exercises: [
      { id: 'hip-thrust',      sets: 3, reps: [8, 12],   rest: 90 },
      { id: 'prensa',          sets: 3, reps: [10, 12],  rest: 90 },
      { id: 'goblet',          sets: 2, reps: [10, 12],  rest: 75 },
      { id: 'ext-cuadriceps',  sets: 2, reps: [12, 15],  rest: 60 },
      { id: 'abduccion',       sets: 2, reps: [15, 20],  rest: 60 },
      { id: 'dead-bug',        sets: 2, reps: [8, 10],   rest: 45 }
    ],
    cardio: {
      label: 'Cinta inclinada',
      intensity: 'Suave-moderado',
      w12: [10, 10],
      w3: [15, 15],
      note: 'Ritmo cómodo después de las pesas.'
    }
  },
  {
    id: 'dia2',
    number: 2,
    title: 'Espalda + tren superior',
    focus: 'Espalda, hombro y postura',
    emoji: '🪽',
    duration: '70-85 min',
    exercises: [
      { id: 'jalon',           sets: 3, reps: [10, 12],  rest: 90 },
      { id: 'remo-sentado',    sets: 3, reps: [10, 12],  rest: 90 },
      { id: 'press-pecho',     sets: 2, reps: [10, 12],  rest: 75 },
      { id: 'aperturas-inv',   sets: 2, reps: [12, 15],  rest: 60, altOf: 'face-pull' },
      { id: 'elev-laterales',  sets: 2, reps: [12, 15],  rest: 60 },
      { id: 'pallof',          sets: 2, reps: [10, 12],  rest: 60 }
    ],
    cardio: {
      label: 'Cinta, bici o elíptica',
      intensity: 'Suave-moderado',
      w12: [15, 15],
      w3: [20, 25],
      note: 'El mejor día para acumular algo más de cardio, porque las pesas son de tren superior.'
    }
  },
  {
    id: 'dia3',
    number: 3,
    title: 'Glúteo + femoral',
    focus: 'Cadena posterior',
    emoji: '🔥',
    duration: '60-75 min',
    exercises: [
      { id: 'hip-thrust',      sets: 3, reps: [8, 12],   rest: 90 },
      { id: 'pm-rumano',       sets: 3, reps: [10, 12],  rest: 90 },
      { id: 'zancada-atras',   sets: 2, reps: [8, 10],   rest: 75 },
      { id: 'curl-femoral',    sets: 3, reps: [10, 15],  rest: 75 },
      { id: 'patada-gluteo',   sets: 2, reps: [12, 15],  rest: 60 },
      { id: 'plancha-lateral', sets: 2, reps: [20, 30],  rest: 45 }
    ],
    cardio: {
      label: 'Bici o caminata fácil',
      intensity: 'Muy suave',
      w12: [5, 10],
      w3: [10, 15],
      note: 'Muy suave después del día fuerte de glúteo y femoral.'
    }
  },
  {
    id: 'dia4',
    number: 4,
    title: 'Glúteo ligero + espalda + abdomen',
    focus: 'Sesión completa y más cardio',
    emoji: '✨',
    duration: '65-80 min',
    exercises: [
      { id: 'step-up',         sets: 2, reps: [10, 10],  rest: 75 },
      { id: 'puente-gluteo',   sets: 2, reps: [12, 15],  rest: 60, optional: true },
      { id: 'jalon',           sets: 2, reps: [10, 12],  rest: 75 },
      { id: 'remo-sentado',    sets: 2, reps: [10, 12],  rest: 75 },
      { id: 'aperturas-inv',   sets: 2, reps: [12, 15],  rest: 60, altOf: 'face-pull' },
      { id: 'crunch-polea',    sets: 2, reps: [12, 15],  rest: 60 }
    ],
    cardio: {
      label: 'Cinta inclinada',
      intensity: 'Suave-moderado',
      w12: [20, 20],
      w3: [25, 30],
      note: 'Es la sesión con más cardio de la semana.'
    }
  }
];

export const WEEKLY_CARDIO_GOAL = { w12: [50, 55], w3: [70, 85] };

export function dayById(id) {
  return PROGRAM.find(d => d.id === id) || null;
}

// Durante las semanas 1 y 2 se hacen solo 2 series aunque la tabla diga 3.
export function setsFor(exercise, week) {
  return week <= 2 ? Math.min(exercise.sets, 2) : exercise.sets;
}

export function cardioTarget(day, week) {
  return week <= 2 ? day.cardio.w12 : day.cardio.w3;
}

export function weeklyCardioGoal(week) {
  return week <= 2 ? WEEKLY_CARDIO_GOAL.w12 : WEEKLY_CARDIO_GOAL.w3;
}

// Consejos y guía del PDF, para la pestaña de rutina.
export const GUIDE = {
  intro: 'No hace falta salir del gimnasio destrozada. La pérdida de grasa depende sobre todo de mantener durante el tiempo un pequeño déficit energético. El cardio no es obligatorio para perder grasa, pero aquí sí lo incluimos de forma estructurada porque fuera del gimnasio habrá poca actividad.',
  before: [
    'Entrena 4 días, pero no hace falta que sean seguidos. Una distribución muy cómoda es lunes, martes, jueves y sábado.',
    'Calienta 5-7 minutos caminando o en bicicleta y haz una primera serie muy ligera del primer ejercicio del día.',
    'Durante las semanas 1 y 2, haz solo 2 series de cada ejercicio aunque la tabla indique 3. Desde la semana 3, pasa al volumen completo si te sientes cómoda.',
    'El peso correcto es el que permite completar las repeticiones con control, sin dolor y dejando 2-3 repeticiones en reserva.',
    'Si una máquina está ocupada, usa la alternativa indicada en la ficha. El cardio se hace siempre al terminar las pesas.'
  ],
  progression: 'Si un ejercicio marca 8-12 repeticiones, mantén el mismo peso hasta poder hacer 12 en todas las series con buena técnica. Entonces sube un poco el peso y vuelve a empezar cerca de 8-10 repeticiones.',
  progressionExample: 'Semana 1: 10, 9 y 9 repeticiones. Semana 2: 11, 10 y 10. Semana 3: 12, 12 y 12. La siguiente vez, subes un poco el peso.',
  cardioIntensity: 'Suave-moderada. Debes poder hablar en frases aunque respires más fuerte. No hace falta correr ni hacer HIIT.',
  cardioRule: 'Si puedes hablar en frases, no necesitas agarrarte y terminas cansada pero no reventada, la intensidad es correcta.',
  crowded: 'Si el gimnasio está lleno y os acercáis a 90 minutos: no hace falta alargar la sesión. Mantén los ejercicios principales, quita primero el puente de glúteo opcional o un accesorio, y si aún vais justos reduce 5 minutos el cardio de ese día. La constancia importa más que exprimir cada minuto.',
  expect: 'Durante las primeras 4-6 semanas lo más normal es notar menos torpeza, más estabilidad y más seguridad usando las máquinas. Los cambios físicos en abdomen, glúteos y piernas llegan poco a poco y dependen también de la alimentación, el descanso y la actividad diaria.'
};
