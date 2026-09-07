// Ficha de un ejercicio, en un panel que sube desde abajo.
import { EXERCISES, DEFAULT_TIP } from '../data/exercises.js';
import { esc } from '../lib/dom.js';
import * as S from '../stats.js';

let el = null;

export function open(id) {
  const m = EXERCISES[id];
  if (!m) return;
  const rec = S.recordsFor(id);
  const last = S.lastPerformance(id);

  if (!el) {
    el = document.createElement('div');
    el.className = 'sheet';
    el.innerHTML = '<div class="sheet__scrim" data-close></div><div class="sheet__panel" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(el);
    el.addEventListener('click', ev => { if (ev.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(); });
  }

  el.querySelector('.sheet__panel').innerHTML = `
    <button class="sheet__handle" type="button" data-close aria-label="Cerrar"></button>
    <span class="pill pill--tag">${esc(m.tag)}</span>
    <h2 class="sheet__title">${esc(m.name)}</h2>

    ${rec ? `<div class="sheet__records">
      ${m.noWeight ? `<div><b>${rec.maxReps}</b><span>tu mejor marca</span></div>`
        : `<div><b>${S.fmtKg(rec.topWeight)} kg</b><span>tu récord</span></div>`}
      ${last ? `<div><b>${last.sets.map(s => m.noWeight ? s.r : `${s.r}×${S.fmtKg(s.w)}`).join(' · ')}</b><span>última vez</span></div>` : ''}
    </div>` : ''}

    <dl class="ficha">
      <dt>Para qué sirve</dt><dd>${esc(m.purpose)}</dd>
      <dt>Cómo hacerlo</dt><dd>${esc(m.how)}</dd>
      <dt>Qué deberías notar</dt><dd>${esc(m.feel)}</dd>
      <dt>Error típico</dt><dd>${esc(m.mistake)}</dd>
      <dt>Alternativa fácil</dt><dd>${esc(m.alt)}</dd>
    </dl>
    <p class="ficha__tip">💡 ${esc(m.tip || DEFAULT_TIP)}</p>
    ${m.weightNote ? `<p class="ficha__tip ficha__tip--soft">En el campo de kg se apunta el ${esc(m.weightNote)}.</p>` : ''}
    <button class="btn btn--soft" type="button" data-close>Cerrar</button>`;

  requestAnimationFrame(() => el.classList.add('is-open'));
  document.body.classList.add('no-scroll');
}

export function close() {
  if (!el) return;
  el.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}
