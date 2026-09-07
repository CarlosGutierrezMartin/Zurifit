// Mensajes de la app. Mantienen la voz del PDF: cariñosa, sin culpa y
// recordándole que lo está haciendo bien. {n} se sustituye por su nombre.

export const NOTES = {
  // Nota del día en la pantalla de inicio
  daily: [
    'Tu novio te quiere muchísimo. Esta rutina está pensada para cuidarte y hacerte más fuerte, no para castigarte.',
    'Hoy solo tienes que aparecer, {n}. Lo demás ya lo hemos dejado escrito.',
    'Que no se te olvide: eres la mejor. Y encima ahora también más fuerte.',
    'No hace falta salir del gimnasio destrozada. Con hacerlo bien y volver, ya has ganado.',
    'Cada vez que abres esta app estás eligiendo cuidarte. Eso ya me parece precioso.',
    'Da igual el peso de hoy: lo que estás construyendo se ve en semanas, no en un día.',
    'Si hoy vas con menos energía, baja el peso y ya está. Sigues siendo la más constante.',
    'Presumo de novia en el trabajo, por si te lo preguntabas.',
    'Prefiero mil veces una técnica fácil y segura que verte intentando levantar un peso absurdo.',
    'Recuerda: 2-3 repeticiones de margen. No hay que llegar al fallo para progresar.',
    'Lo estás haciendo mejor de lo que crees, {n}. Confía en los números de esta app.',
    'La constancia importa más que exprimir cada minuto. Y en constancia eres imbatible.'
  ],
  // Al pulsar "empezar entrenamiento"
  start: [
    'Vamos allá, {n}. Sin prisa y con buena técnica.',
    'Calienta 5-7 minutos y empieza suave. Nadie tiene prisa.',
    'Hoy toca cuidarte. Yo ya estoy orgulloso desde aquí.',
    'Acuérdate del checklist: peso que te deje moverte sin prisas.',
    'A por ello. Que sepas que te quiero exactamente igual antes y después de esta sesión.'
  ],
  // Durante el descanso entre series
  rest: [
    'Respira. El descanso también es parte del entrenamiento.',
    'Bebe un poco de agua, {n}.',
    'Lo estás haciendo genial. En serio.',
    'Aprovecha para colocar bien la máquina para la siguiente serie.',
    'Si la última serie te ha salido fácil, la próxima vez subimos un poquito.',
    'Estos 90 segundos también cuentan como entrenar. Nada de acortarlos por vergüenza.',
    'Eres la mejor. Ya está, tenía que decírtelo.',
    'Ojo a la técnica en la siguiente: hombros lejos de las orejas.'
  ],
  // Al batir un récord
  pr: [
    '¡Récord, {n}! Eso es fuerza nueva que antes no tenías.',
    'Acabas de superarte. Literalmente. Está en los datos.',
    '¡Toma! Esto hace unas semanas no lo movías.',
    'Nuevo récord. Voy a estar insoportable presumiendo de ti.',
    'Más fuerte que la semana pasada. Así se hace.'
  ],
  // Al terminar la sesión
  finish: [
    'Sesión terminada. Te quiero muchísimo, {n}.',
    'Ya está. Has vuelto, que es lo único que de verdad importa.',
    'Otra sesión que nadie te quita. Bien hecho.',
    'Estoy muy orgulloso de ti. Ve a descansar y come bien.',
    'Has aparecido, has entrenado y te has cuidado. Día perfecto.',
    'Lo has hecho. Y encima con buena técnica, que te conozco.'
  ],
  // Si vuelve después de varios días sin entrenar
  comeback: [
    'Qué alegría verte por aquí otra vez, {n}. No hay nada que compensar: seguimos donde lo dejamos.',
    'Bienvenida de vuelta. Nada de hacer el doble hoy, ¿eh? Retomamos y ya.',
    'Han pasado unos días y no pasa absolutamente nada. Lo importante es volver.',
    'Aquí seguía todo guardado, esperándote. Vamos poco a poco.'
  ],
  // Si hace menos cardio del objetivo
  softCardio: [
    'Si hoy has hecho 10 minutos de cardio en vez de 20, te quiero exactamente igual.',
    'El cardio no es un castigo. Lo que has hecho ya suma.'
  ],
  // Al desbloquear un logro
  achievement: [
    '¡Logro nuevo, {n}! Esto no lo regala nadie.',
    'Mira lo que acabas de conseguir. Te lo has ganado tú sola.',
    'Otra medalla para la colección. Qué máquina eres.'
  ],
  // Onboarding
  hello: [
    'Hola, {n}. He hecho esta app para ti, para que veas negro sobre blanco lo fuerte que te estás poniendo.',
    'Bienvenida, {n}. Aquí solo hay una regla: cuidarte, no castigarte.'
  ]
};

export const LEVELS = [
  { min: 0,     name: 'Empezando',    emoji: '🌱' },
  { min: 300,   name: 'Constante',    emoji: '🌸' },
  { min: 900,   name: 'En racha',     emoji: '☀️' },
  { min: 2000,  name: 'Fuerte',       emoji: '💪' },
  { min: 4000,  name: 'Imparable',    emoji: '🔥' },
  { min: 7000,  name: 'Veterana',     emoji: '⭐' },
  { min: 11000, name: 'Bestia parda', emoji: '🦋' },
  { min: 16000, name: 'Leyenda',      emoji: '👑' }
];

export function pick(list, seed) {
  if (!list || !list.length) return '';
  const i = seed === undefined
    ? Math.floor(Math.random() * list.length)
    : Math.abs(Math.floor(seed)) % list.length;
  return list[i];
}

export function note(kind, name, seed) {
  return pick(NOTES[kind], seed).replace(/\{n\}/g, name || 'guapa');
}
