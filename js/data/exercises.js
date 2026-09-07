// Biblioteca de ejercicios. Todo el contenido de las fichas viene del PDF
// "Rutina de gimnasio - 4 días · principiante".
//
// unit:      'reps' (repeticiones) | 'time' (segundos de aguante)
// perSide:   true si las repeticiones/segundos son por lado
// noWeight:  true si el ejercicio no lleva carga externa
// step:      incremento sugerido de peso (kg) cuando toca subir
// weightNote: aclaración para el campo de peso

export const EXERCISES = {
  'hip-thrust': {
    name: 'Hip thrust con banco + mancuerna',
    short: 'Hip thrust',
    tag: 'GLÚTEO',
    group: 'piernas',
    unit: 'reps', step: 2.5, weightNote: 'peso de la mancuerna',
    purpose: 'Es uno de los ejercicios principales para fortalecer y dar forma al glúteo usando material sencillo.',
    how: 'Apoya la parte alta de la espalda en un banco. Coloca una mancuerna sobre la pelvis, pies firmes y separados al ancho de las caderas. Sube la pelvis hasta quedar con hombros, cadera y rodillas casi en línea. Baja despacio.',
    feel: 'Sobre todo glúteos. Arriba, apriétalos 1 segundo.',
    mistake: 'Subir arqueando demasiado la zona lumbar o colocar los pies tan lejos que solo trabajen los muslos.',
    alt: 'Puente de glúteo en el suelo, sin peso o con una mancuerna ligera.'
  },
  'prensa': {
    name: 'Prensa de piernas',
    short: 'Prensa',
    tag: 'PIERNA + GLÚTEO',
    group: 'piernas',
    unit: 'reps', step: 5, weightNote: 'peso de la máquina',
    purpose: 'Permite trabajar piernas con mucha estabilidad, algo ideal al empezar.',
    how: 'Coloca toda la espalda contra el respaldo. Baja la plataforma hasta donde puedas sin que la pelvis se despegue y empuja con toda la planta del pie. No bloquees las rodillas arriba.',
    feel: 'Muslos y glúteos. La espalda debe sentirse estable y cómoda.',
    mistake: 'Bajar demasiado hasta redondear la espalda o juntar las rodillas hacia dentro.',
    alt: 'Sentadilla a un banco con el propio peso.'
  },
  'goblet': {
    name: 'Sentadilla goblet a banco',
    short: 'Sentadilla goblet',
    tag: 'PIERNA',
    group: 'piernas',
    unit: 'reps', step: 2, weightNote: 'peso de la mancuerna',
    purpose: 'Enseña el patrón de sentadilla con seguridad y ayuda a ganar fuerza general de piernas.',
    how: 'Sujeta una mancuerna ligera cerca del pecho. Lleva la cadera hacia atrás y abajo hasta tocar suavemente el banco. Levántate empujando el suelo con los pies.',
    feel: 'Cuádriceps y glúteos. El tronco puede inclinarse un poco, pero debe sentirse controlado.',
    mistake: 'Dejarse caer sobre el banco o intentar bajar más de lo que permite la movilidad.',
    alt: 'Sentarse y levantarse de un banco sin peso.'
  },
  'ext-cuadriceps': {
    name: 'Extensión de cuádriceps en máquina',
    short: 'Extensión de cuádriceps',
    tag: 'CUÁDRICEPS',
    group: 'piernas',
    unit: 'reps', step: 2.5, weightNote: 'peso de la máquina',
    purpose: 'Fortalece la parte delantera del muslo de forma muy sencilla.',
    how: 'Ajusta el respaldo para que la rodilla quede alineada con el eje de la máquina. Estira las piernas sin dar patada y baja despacio.',
    feel: 'Trabajo localizado en la parte delantera de los muslos.',
    mistake: 'Usar demasiado peso y lanzar la carga con impulso.',
    alt: 'Prensa de piernas con poco peso o sentadilla a banco.'
  },
  'abduccion': {
    name: 'Abducción de cadera en máquina',
    short: 'Abducción de cadera',
    tag: 'GLÚTEO LATERAL',
    group: 'piernas',
    unit: 'reps', step: 5, weightNote: 'peso de la máquina',
    purpose: 'Trabaja la parte lateral del glúteo y ayuda a estabilizar cadera y rodillas.',
    how: 'Siéntate estable, abre las rodillas de forma controlada y vuelve lentamente. No necesitas abrir al máximo.',
    feel: 'Quemazón o esfuerzo en los laterales de los glúteos.',
    mistake: 'Rebotar, mover todo el tronco o poner un peso que obligue a hacer impulso.',
    alt: 'Caminatas laterales con minibanda o abducción acostada de lado.'
  },
  'pm-rumano': {
    name: 'Peso muerto rumano con mancuernas',
    short: 'Peso muerto rumano',
    tag: 'GLÚTEO + FEMORAL',
    group: 'piernas',
    unit: 'reps', step: 2, weightNote: 'peso de cada mancuerna',
    purpose: 'Fortalece la parte posterior de las piernas y glúteos.',
    how: 'Con mancuernas ligeras pegadas a los muslos, lleva la cadera hacia atrás con las rodillas ligeramente flexionadas. Baja solo hasta donde mantengas la espalda cómoda y vuelve apretando glúteos.',
    feel: 'Estiramiento en la parte posterior de los muslos y trabajo de glúteos.',
    mistake: 'Intentar tocar el suelo y redondear la espalda. El objetivo no es bajar mucho.',
    alt: 'Peso muerto rumano sin peso frente a una pared, practicando solo llevar la cadera atrás.'
  },
  'zancada-atras': {
    name: 'Zancada atrás asistida',
    short: 'Zancada atrás',
    tag: 'PIERNA + GLÚTEO',
    group: 'piernas',
    unit: 'reps', perSide: true, step: 2, weightNote: 'peso de cada mancuerna (0 si es sin peso)',
    purpose: 'Trabaja cada pierna por separado sin exigir tanto equilibrio como una búlgara.',
    how: 'Sujétate ligeramente a una barra o soporte. Da un paso hacia atrás, baja de forma cómoda y vuelve empujando con la pierna delantera.',
    feel: 'Glúteo y muslo de la pierna delantera.',
    mistake: 'Dar un paso demasiado corto o depender del brazo para levantarse.',
    alt: 'Split squat estático con apoyo o step-up a un cajón bajo.'
  },
  'curl-femoral': {
    name: 'Curl femoral en máquina',
    short: 'Curl femoral',
    tag: 'FEMORAL',
    group: 'piernas',
    unit: 'reps', step: 2.5, weightNote: 'peso de la máquina',
    purpose: 'Fortalece la parte posterior del muslo de forma muy controlada.',
    how: 'Ajusta la máquina para que la rodilla coincida con su eje. Flexiona las rodillas sin levantar la cadera y vuelve despacio.',
    feel: 'Parte posterior de los muslos.',
    mistake: 'Rebotar o despegar la pelvis para mover más peso.',
    alt: 'Puente de glúteo con talones algo alejados del cuerpo.'
  },
  'patada-gluteo': {
    name: 'Patada de glúteo en máquina',
    short: 'Patada de glúteo',
    tag: 'GLÚTEO',
    group: 'piernas',
    unit: 'reps', perSide: true, step: 2.5, weightNote: 'peso de la máquina',
    purpose: 'Permite trabajar el glúteo de forma guiada y muy estable, ideal para principiantes.',
    how: 'Apoya el cuerpo como indique la máquina, coloca un pie en la plataforma y empuja la pierna hacia atrás de forma controlada. Vuelve lento sin perder la postura.',
    feel: 'Glúteo de la pierna que empuja, sin dolor lumbar.',
    mistake: 'Empujar con impulso, girar la pelvis o arquear demasiado la espalda.',
    alt: 'Patada de glúteo en polea o a cuatro apoyos en el suelo.'
  },
  'step-up': {
    name: 'Step-up a cajón bajo',
    short: 'Step-up',
    tag: 'PIERNA + GLÚTEO',
    group: 'piernas',
    unit: 'reps', perSide: true, step: 2, weightNote: 'peso de cada mancuerna (0 si es sin peso)',
    purpose: 'Trabaja piernas y glúteos con un movimiento parecido a subir escaleras.',
    how: 'Usa un cajón bajo. Apoya todo el pie arriba y sube empujando principalmente con esa pierna. Baja con control. Puedes sujetarte ligeramente.',
    feel: 'Glúteo y muslo de la pierna que está sobre el cajón.',
    mistake: 'Elegir un cajón demasiado alto o impulsarse demasiado con la pierna de abajo.',
    alt: 'Prensa unilateral muy ligera o zancada atrás asistida.'
  },
  'puente-gluteo': {
    name: 'Puente de glúteo',
    short: 'Puente de glúteo',
    tag: 'GLÚTEO',
    group: 'piernas',
    unit: 'reps', step: 2, weightNote: 'peso extra (0 si es sin peso)',
    purpose: 'Es una versión muy sencilla del hip thrust y funciona bien como trabajo ligero.',
    how: 'Túmbate boca arriba con pies apoyados. Eleva la pelvis apretando glúteos y baja lentamente. Mantén las costillas relajadas.',
    feel: 'Glúteos, sin presión en la zona lumbar.',
    mistake: 'Empujar desde la espalda o colocar los pies demasiado lejos.',
    alt: 'Máquina de hip thrust con muy poco peso.'
  },
  'jalon': {
    name: 'Jalón al pecho',
    short: 'Jalón al pecho',
    tag: 'ESPALDA',
    group: 'espalda',
    unit: 'reps', step: 2.5, weightNote: 'peso de la máquina',
    purpose: 'Fortalece dorsales y ayuda a crear una espalda más fuerte y estable.',
    how: 'Siéntate con muslos sujetos. Baja la barra hacia la parte alta del pecho llevando los codos hacia abajo. Sube despacio hasta estirar los brazos.',
    feel: 'Laterales de la espalda y zona bajo las axilas, no solo brazos.',
    mistake: 'Echarse muy atrás o tirar de la barra detrás de la nuca.',
    alt: 'Jalón con agarre neutro o máquina de dorsales con agarres independientes.'
  },
  'remo-sentado': {
    name: 'Remo sentado en polea o máquina',
    short: 'Remo sentado',
    tag: 'ESPALDA + POSTURA',
    group: 'espalda',
    unit: 'reps', step: 2.5, weightNote: 'peso de la máquina',
    purpose: 'Fortalece la zona media de la espalda, muy útil si tiende a llevar los hombros hacia delante.',
    how: 'Mantén el pecho cómodo y la espalda estable. Lleva el agarre hacia las costillas y piensa en acercar los codos al cuerpo. Vuelve sin dejar que los hombros se disparen hacia delante.',
    feel: 'Zona entre los omóplatos y dorsales.',
    mistake: 'Balancear el tronco hacia delante y atrás para mover más peso.',
    alt: 'Remo con pecho apoyado en máquina.'
  },
  'press-pecho': {
    name: 'Press de pecho en máquina',
    short: 'Press de pecho',
    tag: 'TREN SUPERIOR',
    group: 'espalda',
    unit: 'reps', step: 2.5, weightNote: 'peso de la máquina',
    purpose: 'Aporta fuerza general al tren superior y mantiene el trabajo equilibrado entre empujar y tirar.',
    how: 'Apoya bien espalda y cabeza. Empuja las asas hacia delante sin elevar los hombros y vuelve hasta una posición cómoda.',
    feel: 'Pecho y parte anterior de brazos, sin dolor en hombros.',
    mistake: 'Abrir demasiado los codos o despegar la espalda del respaldo.',
    alt: 'Press con mancuernas muy ligeras en banco o flexiones contra una pared.'
  },
  'aperturas-inv': {
    name: 'Aperturas inversas en máquina',
    short: 'Aperturas inversas',
    tag: 'POSTURA + HOMBRO',
    group: 'espalda',
    unit: 'reps', step: 2.5, weightNote: 'peso de la máquina',
    purpose: 'Fortalece la parte posterior del hombro y la zona alta de la espalda.',
    how: 'Con el pecho apoyado, abre los brazos hacia los lados con los codos ligeramente flexionados. Vuelve despacio.',
    feel: 'Parte posterior de hombros y zona alta de la espalda.',
    mistake: 'Encoger los hombros hacia las orejas o usar impulso.',
    alt: 'Pájaros con mancuernas de 1-3 kg apoyando el pecho en un banco inclinado. También vale el face pull en polea.'
  },
  'face-pull': {
    name: 'Face pull en polea',
    short: 'Face pull',
    tag: 'POSTURA',
    group: 'espalda',
    unit: 'reps', step: 2.5, weightNote: 'peso de la polea',
    purpose: 'Refuerza hombro posterior y musculatura que ayuda a mantener los hombros bien controlados.',
    how: 'Coloca la cuerda aproximadamente a la altura de la cara. Tira hacia la nariz o frente separando las manos al final. Mantén los hombros lejos de las orejas.',
    feel: 'Parte alta de la espalda y parte posterior de hombros.',
    mistake: 'Convertirlo en un remo hacia el pecho o arquear la espalda.',
    alt: 'Aperturas inversas en máquina, que son incluso más fáciles de aprender.'
  },
  'elev-laterales': {
    name: 'Elevaciones laterales',
    short: 'Elevaciones laterales',
    tag: 'HOMBRO',
    group: 'espalda',
    unit: 'reps', step: 1, weightNote: 'peso de cada mancuerna',
    purpose: 'Fortalece el hombro y ayuda a dar una apariencia más equilibrada al tren superior.',
    how: 'Con mancuernas muy ligeras, eleva los brazos hacia los lados hasta aproximadamente la altura de los hombros. Baja lentamente.',
    feel: 'Parte lateral del hombro.',
    mistake: 'Encoger los hombros o elegir demasiado peso y balancearse.',
    alt: 'Máquina de elevación lateral o una sola mancuerna cada vez.'
  },
  'dead-bug': {
    name: 'Dead bug',
    short: 'Dead bug',
    tag: 'CORE + POSTURA',
    group: 'core',
    unit: 'reps', perSide: true, noWeight: true,
    purpose: 'Enseña a mantener el abdomen activo mientras se mueven brazos y piernas.',
    how: 'Túmbate boca arriba con caderas y rodillas a 90 grados. Mantén la zona lumbar suave contra el suelo. Estira una pierna y el brazo contrario sin perder esa posición, vuelve y cambia.',
    feel: 'Abdomen trabajando, sin tensión fuerte en cuello o espalda baja.',
    mistake: 'Arquear la espalda cuando se aleja la pierna. Si ocurre, haz el recorrido más corto.',
    alt: 'Mover solo una pierna cada vez y dejar los brazos quietos.'
  },
  'pallof': {
    name: 'Pallof press',
    short: 'Pallof press',
    tag: 'CORE + POSTURA',
    group: 'core',
    unit: 'reps', perSide: true, step: 2.5, weightNote: 'peso de la polea',
    purpose: 'Trabaja el abdomen evitando que el tronco rote. Es muy útil para aprender estabilidad.',
    how: 'Colócate de lado a una polea o banda. Lleva el agarre desde el pecho hacia delante y mantenlo 1 segundo sin dejar que el cuerpo gire.',
    feel: 'Abdomen y laterales del tronco, manteniendo una postura firme.',
    mistake: 'Girar el cuerpo hacia la polea o usar un peso que te arrastre.',
    alt: 'Hacerlo con una banda elástica ligera en casa.'
  },
  'plancha-lateral': {
    name: 'Plancha lateral con rodillas apoyadas',
    short: 'Plancha lateral',
    tag: 'CORE',
    group: 'core',
    unit: 'time', perSide: true, noWeight: true,
    purpose: 'Fortalece los laterales del abdomen y mejora la estabilidad del tronco.',
    how: 'Apoya antebrazo y rodillas. Eleva la cadera hasta formar una línea cómoda desde hombros a rodillas. Mantén respirando.',
    feel: 'Lateral del abdomen y algo de glúteo.',
    mistake: 'Dejar caer la cadera o aguantar la respiración.',
    alt: 'Mantener menos segundos o hacer Pallof press.'
  },
  'crunch-polea': {
    name: 'Crunch en polea de rodillas',
    short: 'Crunch en polea',
    tag: 'ABDOMEN',
    group: 'core',
    unit: 'reps', step: 2.5, weightNote: 'peso de la polea',
    purpose: 'Sirve para trabajar el abdomen de forma sencilla y progresiva aunque no haya máquina específica.',
    how: 'Colócate de rodillas frente a una polea alta con cuerda. Sujeta la cuerda a ambos lados de la cabeza o frente. Lleva las costillas hacia la pelvis haciendo una flexión del tronco. Sube despacio.',
    feel: 'Abdomen, sobre todo la zona central, sin tirar con los brazos.',
    mistake: 'Mover solo los brazos, sentarse sobre los talones o usar demasiado peso y perder el control.',
    alt: 'Crunch corto en colchoneta o dead bug si todavía molesta el cuello.'
  },
  'cardio-cinta': {
    name: 'Caminata en cinta con inclinación',
    short: 'Cardio',
    tag: 'CARDIO',
    group: 'cardio',
    unit: 'time', noWeight: true,
    purpose: 'Aumenta el gasto energético y mejora la resistencia. En esta rutina tiene especial sentido porque fuera del gimnasio habrá poca actividad.',
    how: 'Camina a un ritmo que te haga respirar algo más fuerte pero te permita hablar en frases. Empieza con poca inclinación y súbela solo si puedes mantener la postura sin agarrarte a las barras.',
    feel: 'Respiración más intensa y trabajo general de piernas, pero sin acabar exhausta.',
    mistake: 'Poner tanta velocidad o inclinación que haya que agarrarse o convertir cada sesión en una prueba de resistencia.',
    alt: 'Bicicleta estática o elíptica manteniendo la misma sensación de esfuerzo.',
    tip: 'Primero aumenta los minutos; después, si se vuelve demasiado fácil, sube un poco la inclinación o la resistencia.'
  }
};

export const DEFAULT_TIP = 'Empieza con un peso que te deje acabar la serie con 2-3 repeticiones de margen.';

export const GROUPS = {
  piernas: 'Glúteos y piernas',
  espalda: 'Espalda y tren superior',
  core: 'Core y abdomen',
  cardio: 'Cardio',
  propios: 'Mis ejercicios'
};

export const MATERIAL = [
  'Prensa de piernas',
  'Máquina de abducción',
  'Extensión de cuádriceps',
  'Curl femoral',
  'Jalón al pecho',
  'Remo sentado o máquina de remo',
  'Press de pecho en máquina',
  'Máquina de aperturas inversas o contractor reversible',
  'Polea alta / regulable',
  'Máquina de patada de glúteo',
  'Cinta de correr con inclinación o cualquier opción de cardio suave',
  'Mancuernas, banco, cajón bajo o step y esterilla'
];

export const CHECKLIST = [
  '¿Sé qué parte del cuerpo quiero trabajar?',
  '¿El peso me permite moverme sin prisas?',
  '¿Puedo respirar durante la serie?',
  '¿Siento esfuerzo muscular y no dolor articular?',
  '¿Podría hacer 2-3 repeticiones más si fuera necesario?'
];
