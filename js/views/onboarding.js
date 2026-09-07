import { createProfile, todayISO } from '../store.js';
import { esc } from '../lib/dom.js';
import { confetti } from '../lib/fx.js';

const EMOJIS = ['🌸', '🦋', '🌺', '🍑', '💗', '⭐', '🌷', '🐣'];

export default {
  render() {
    return `
    <div class="onb">
      <div class="onb__art" aria-hidden="true">
        <span class="onb__blob onb__blob--1"></span>
        <span class="onb__blob onb__blob--2"></span>
        <span class="onb__logo">💪</span>
      </div>
      <h1 class="onb__title">Zurifit</h1>
      <p class="onb__sub">Tu rutina de 4 días, con todo tu progreso guardado en tu móvil.</p>

      <form class="onb__form" id="onb-form">
        <label class="field">
          <span class="field__label">¿Cómo te llamas?</span>
          <input class="field__input" id="onb-name" type="text" required maxlength="24"
                 autocomplete="given-name" placeholder="Tu nombre">
        </label>

        <fieldset class="field">
          <legend class="field__label">Elige tu emoji</legend>
          <div class="emoji-picker" id="onb-emoji">
            ${EMOJIS.map((e, i) => `<button type="button" class="emoji-picker__btn${i === 0 ? ' is-on' : ''}"
              data-emoji="${e}" aria-pressed="${i === 0}">${e}</button>`).join('')}
          </div>
        </fieldset>

        <label class="field">
          <span class="field__label">¿Qué día empiezas (o empezaste)?</span>
          <input class="field__input" id="onb-date" type="date" value="${esc(todayISO())}" required>
          <span class="field__help">Sirve para saber en qué semana del programa estás: las semanas 1 y 2 son de adaptación.</span>
        </label>

        <button class="btn btn--primary btn--xl" type="submit">Empezar</button>
        <p class="onb__legal">Todo se guarda solo en este dispositivo. No hay cuentas ni internet de por medio.</p>
      </form>
    </div>`;
  },

  mounted(root, params, ctx) {
    let emoji = EMOJIS[0];
    root.querySelector('#onb-emoji').addEventListener('click', ev => {
      const btn = ev.target.closest('[data-emoji]');
      if (!btn) return;
      root.querySelectorAll('.emoji-picker__btn').forEach(b => {
        b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-on');
      btn.setAttribute('aria-pressed', 'true');
      emoji = btn.dataset.emoji;
    });

    root.querySelector('#onb-form').addEventListener('submit', ev => {
      ev.preventDefault();
      const name = root.querySelector('#onb-name').value.trim();
      const startDate = root.querySelector('#onb-date').value || todayISO();
      if (!name) return;
      createProfile({ name, emoji, startDate });
      confetti({ count: 70 });
      ctx.go('#/inicio');
    });
  }
};
