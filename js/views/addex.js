// Panel para añadir un ejercicio: elegir uno que ya existe o crear uno nuevo
// con el nombre que quiera. Por defecto se registra con kg, repeticiones y
// series, igual que el resto.

import { EXERCISES, GROUPS } from '../data/exercises.js';
import { PROGRAM } from '../data/program.js';
import { addCustomExercise } from '../store.js';
import { esc } from '../lib/dom.js';
import { haptic, toast } from '../lib/fx.js';

let el = null;
let ctxData = null;

// Dónde acaba el ejercicio: fijo en un día de la rutina, solo por hoy, o
// simplemente guardado en la lista de ejercicios propios.
function destino(suffix) {
  const { mode, dayId, dayNumber } = ctxData;
  if (mode === 'session') {
    return `<label class="check check--main"><input type="checkbox" id="${suffix}-perm" checked>
      <span>Dejarlo fijo en el Día ${dayNumber} para las próximas veces</span></label>`;
  }
  if (mode === 'day') {
    return `<p class="addex__dest">Se añadirá al <b>Día ${dayNumber}</b> de tu rutina.</p>`;
  }
  return `<label class="field">
      <span class="field__label">¿A qué día lo añado?</span>
      <select class="select" id="${suffix}-day">
        <option value="">Solo guardarlo en mi lista</option>
        ${PROGRAM.map(d => `<option value="${d.id}">Día ${d.number} · ${d.title}</option>`).join('')}
      </select>
    </label>`;
}

function panel() {
  const { dayNumber, taken } = ctxData;
  const options = Object.entries(GROUPS).map(([g, label]) => {
    const items = Object.entries(EXERCISES)
      .filter(([id, m]) => m.group === g && !taken.includes(id));
    if (!items.length) return '';
    return `<optgroup label="${esc(label)}">${items
      .map(([id, m]) => `<option value="${esc(id)}">${esc(m.name)}</option>`).join('')}</optgroup>`;
  }).join('');

  return `
    <button class="sheet__handle" type="button" data-close aria-label="Cerrar"></button>
    <h2 class="sheet__title">Añadir ejercicio${dayNumber ? ` al Día ${dayNumber}` : ''}</h2>

    <div class="tabs tabs--sub" role="tablist">
      <button class="tab is-on" data-addtab="nuevo">Crear uno nuevo</button>
      <button class="tab" data-addtab="existente">Elegir de la lista</button>
    </div>

    <form id="addex-nuevo" class="addex">
      <label class="field">
        <span class="field__label">¿Cómo se llama?</span>
        <input class="field__input" id="ax-name" type="text" maxlength="40" required
               placeholder="Por ejemplo: Patada de glúteo en polea">
      </label>

      <div class="addex__row">
        <label class="field">
          <span class="field__label">Series</span>
          <input class="field__input" id="ax-sets" type="number" inputmode="numeric" min="1" max="10" value="3">
        </label>
        <label class="field">
          <span class="field__label">Reps mín.</span>
          <input class="field__input" id="ax-rmin" type="number" inputmode="numeric" min="1" max="100" value="8">
        </label>
        <label class="field">
          <span class="field__label">Reps máx.</span>
          <input class="field__input" id="ax-rmax" type="number" inputmode="numeric" min="1" max="100" value="12">
        </label>
        <label class="field">
          <span class="field__label">Descanso</span>
          <input class="field__input" id="ax-rest" type="number" inputmode="numeric" min="15" max="300" step="15" value="75">
        </label>
      </div>

      <details class="addex__more">
        <summary>Opciones (solo si no lleva peso o va por tiempo)</summary>
        <label class="check"><input type="checkbox" id="ax-noweight"> <span>Sin peso (solo repeticiones)</span></label>
        <label class="check"><input type="checkbox" id="ax-time"> <span>Se mide en segundos (planchas, isométricos)</span></label>
        <label class="check"><input type="checkbox" id="ax-side"> <span>Las repeticiones son por lado</span></label>
      </details>

      ${destino('ax')}

      <button class="btn btn--primary btn--xl" type="submit">Añadir ejercicio</button>
    </form>

    <form id="addex-existente" class="addex" hidden>
      ${options ? `
      <label class="field">
        <span class="field__label">Ejercicio</span>
        <select class="select" id="ax-pick">${options}</select>
      </label>

      <div class="addex__row">
        <label class="field">
          <span class="field__label">Series</span>
          <input class="field__input" id="ax2-sets" type="number" inputmode="numeric" min="1" max="10" value="3">
        </label>
        <label class="field">
          <span class="field__label">Reps mín.</span>
          <input class="field__input" id="ax2-rmin" type="number" inputmode="numeric" min="1" max="100" value="8">
        </label>
        <label class="field">
          <span class="field__label">Reps máx.</span>
          <input class="field__input" id="ax2-rmax" type="number" inputmode="numeric" min="1" max="100" value="12">
        </label>
        <label class="field">
          <span class="field__label">Descanso</span>
          <input class="field__input" id="ax2-rest" type="number" inputmode="numeric" min="15" max="300" step="15" value="75">
        </label>
      </div>

      ${destino('ax2')}

      <button class="btn btn--primary btn--xl" type="submit">Añadir ejercicio</button>`
      : '<p class="chart-empty">Ya están todos los ejercicios metidos en este día.</p>'}
    </form>`;
}

function num(root, id, fallback) {
  const v = Number(root.querySelector('#' + id)?.value);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// mode: 'session' (añadir al entrenamiento en curso), 'day' (fijo en un día)
//       o 'library' (crear y elegir día después).
export function open({ mode = 'library', dayId = null, dayNumber = null, taken = [], onAdd }) {
  ctxData = { mode, dayId, dayNumber, taken, onAdd };

  if (!el) {
    el = document.createElement('div');
    el.className = 'sheet';
    el.innerHTML = '<div class="sheet__scrim" data-close></div><div class="sheet__panel" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(el);
    el.addEventListener('click', ev => { if (ev.target.closest('[data-close]')) close(); });
  }

  const box = el.querySelector('.sheet__panel');
  box.innerHTML = panel();

  box.addEventListener('click', ev => {
    const t = ev.target.closest('[data-addtab]');
    if (!t) return;
    const which = t.dataset.addtab;
    box.querySelectorAll('[data-addtab]').forEach(b => b.classList.toggle('is-on', b === t));
    box.querySelector('#addex-nuevo').hidden = which !== 'nuevo';
    box.querySelector('#addex-existente').hidden = which !== 'existente';
  });

  box.querySelector('#addex-nuevo')?.addEventListener('submit', ev => {
    ev.preventDefault();
    const name = box.querySelector('#ax-name').value.trim();
    if (!name) return;
    const isTime = box.querySelector('#ax-time').checked;
    const id = addCustomExercise({
      name,
      unit: isTime ? 'time' : 'reps',
      noWeight: box.querySelector('#ax-noweight').checked || isTime,
      perSide: box.querySelector('#ax-side').checked
    });
    finish(id, {
      sets: num(box, 'ax-sets', 3),
      reps: [num(box, 'ax-rmin', 8), num(box, 'ax-rmax', 12)],
      rest: num(box, 'ax-rest', 75)
    }, target(box, 'ax'));
  });

  box.querySelector('#addex-existente')?.addEventListener('submit', ev => {
    ev.preventDefault();
    const id = box.querySelector('#ax-pick')?.value;
    if (!id) return;
    finish(id, {
      sets: num(box, 'ax2-sets', 3),
      reps: [num(box, 'ax2-rmin', 8), num(box, 'ax2-rmax', 12)],
      rest: num(box, 'ax2-rest', 75)
    }, target(box, 'ax2'));
  });

  requestAnimationFrame(() => el.classList.add('is-open'));
  document.body.classList.add('no-scroll');
}

// Devuelve el día al que hay que fijar el ejercicio, o null.
function target(box, suffix) {
  const { mode, dayId } = ctxData;
  if (mode === 'session') return box.querySelector(`#${suffix}-perm`)?.checked ? dayId : null;
  if (mode === 'day') return dayId;
  return box.querySelector(`#${suffix}-day`)?.value || null;
}

function finish(id, cfg, dayTarget) {
  const entry = { id, sets: cfg.sets, reps: [Math.min(...cfg.reps), Math.max(...cfg.reps)], rest: cfg.rest };
  close();
  haptic([12, 40, 12]);
  toast(`${EXERCISES[id].short} añadido`, { icon: '➕' });
  ctxData.onAdd?.(entry, dayTarget);
}

export function close() {
  if (!el) return;
  el.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}
