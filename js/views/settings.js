import { getState, update, exportJSON, importJSON, resetAll, firstName,
         programWeek, todayISO } from '../store.js';
import { esc } from '../lib/dom.js';
import { toast } from '../lib/fx.js';
import * as S from '../stats.js';

const TOGGLES = [
  { key: 'autoRest', label: 'Cronómetro automático', help: 'Arranca el descanso al marcar una serie.' },
  { key: 'sound',    label: 'Sonido',                help: 'Pitido al terminar el descanso y al batir un récord.' },
  { key: 'vibrate',  label: 'Vibración',             help: 'Pequeña vibración al marcar series.' },
  { key: 'showRir',  label: 'Preguntar repeticiones en reserva', help: 'Tras cada serie, apunta cuántas te quedaban. Ayuda a saber cuándo subir peso.' }
];

export default {
  render() {
    const st = getState();
    const stats = S.globalStats();
    return `
    <header class="topbar topbar--simple"><h1>Tu perfil</h1></header>
    <div class="pad pad--flush">

      <section class="card card--profile">
        <span class="avatar avatar--lg">${esc(st.profile.emoji)}</span>
        <div>
          <h2>${esc(st.profile.name)}</h2>
          <p class="card__meta">Empezaste el ${esc(S.fmtDateLong(st.profile.startDate))}</p>
          <p class="card__meta">Semana ${programWeek()} · ${stats.totalSessions} entrenos · ${S.fmtBig(stats.totalVolume)} kg movidos</p>
        </div>
      </section>

      <section class="card">
        <h3 class="section-title">Datos</h3>
        <label class="field">
          <span class="field__label">Nombre</span>
          <input class="field__input" id="set-name" type="text" maxlength="24" value="${esc(st.profile.name)}">
        </label>
        <label class="field">
          <span class="field__label">Fecha de inicio</span>
          <input class="field__input" id="set-date" type="date" value="${esc(st.profile.startDate)}" max="${esc(todayISO())}">
          <span class="field__help">Define en qué semana del programa estás.</span>
        </label>
        <label class="field">
          <span class="field__label">Semana del programa</span>
          <select class="select" id="set-week">
            <option value="">Automática (semana ${programWeek()})</option>
            ${Array.from({ length: 24 }, (_, i) => i + 1).map(w =>
              `<option value="${w}"${st.settings.weekOverride === w ? ' selected' : ''}>Semana ${w}</option>`).join('')}
          </select>
          <span class="field__help">Las semanas 1 y 2 usan 2 series por ejercicio y menos cardio.</span>
        </label>
      </section>

      <section class="card">
        <h3 class="section-title">Durante el entrenamiento</h3>
        ${TOGGLES.map(t => `
          <label class="switch">
            <span>
              <b>${esc(t.label)}</b>
              <small>${esc(t.help)}</small>
            </span>
            <input type="checkbox" data-toggle="${t.key}" ${getState().settings[t.key] ? 'checked' : ''}>
            <span class="switch__ui" aria-hidden="true"></span>
          </label>`).join('')}
      </section>

      <section class="card">
        <h3 class="section-title">Tenerla siempre a mano</h3>
        <p class="card__meta">Instálala como app para abrirla de un toque y que funcione sin conexión en el gimnasio.</p>
        <ul class="ticks ticks--dot">
          <li><b>iPhone (Safari):</b> botón de compartir → «Añadir a pantalla de inicio».</li>
          <li><b>Android (Chrome):</b> menú ⋮ → «Instalar aplicación».</li>
        </ul>
      </section>

      <section class="card">
        <h3 class="section-title">Copia de seguridad</h3>
        <p class="card__meta">Todo tu progreso vive solo en este móvil. Descarga una copia de vez en cuando por si cambias de teléfono.</p>
        <div class="btn-row">
          <button class="btn btn--soft" type="button" data-act="export">Descargar copia</button>
          <button class="btn btn--soft" type="button" data-act="import">Restaurar copia</button>
        </div>
        <input type="file" id="import-file" accept="application/json,.json" hidden>
      </section>

      <section class="card">
        <h3 class="section-title">Zona peligrosa</h3>
        <button class="btn btn--danger" type="button" data-act="reset">Borrar todos mis datos</button>
      </section>

      <p class="closing">Hecho con muchísimo cariño para ti, ${esc(firstName())}. 💗</p>
      <p class="version">Zurifit · versión local</p>
    </div>`;
  },

  mounted(root, params, ctx) {
    root.querySelector('#set-name')?.addEventListener('change', ev => {
      const v = ev.target.value.trim();
      if (v) { update(s => { s.profile.name = v; }); toast('Nombre actualizado', { icon: '✏️' }); }
    });
    root.querySelector('#set-date')?.addEventListener('change', ev => {
      if (ev.target.value) { update(s => { s.profile.startDate = ev.target.value; }); ctx.rerender(); }
    });
    root.querySelector('#set-week')?.addEventListener('change', ev => {
      const v = ev.target.value ? Number(ev.target.value) : null;
      update(s => { s.settings.weekOverride = v; });
      ctx.rerender();
    });

    root.addEventListener('change', ev => {
      const t = ev.target.closest('[data-toggle]');
      if (!t) return;
      update(s => { s.settings[t.dataset.toggle] = t.checked; });
    });

    root.addEventListener('click', ev => {
      const act = ev.target.closest('[data-act]')?.dataset.act;
      if (act === 'export') {
        const blob = new Blob([exportJSON()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `zurifit-${todayISO()}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        toast('Copia descargada', { icon: '💾' });
      }
      if (act === 'import') root.querySelector('#import-file').click();
      if (act === 'reset') {
        if (confirm('Esto borrará tu perfil, tus entrenos y tus récords. ¿Seguro?') &&
            confirm('De verdad de la buena: no se puede deshacer. ¿Borramos?')) {
          resetAll();
          location.hash = '#/inicio';
          location.reload();
        }
      }
    });

    root.querySelector('#import-file')?.addEventListener('change', ev => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          importJSON(reader.result);
          toast('Copia restaurada', { icon: '✅' });
          location.reload();
        } catch (err) {
          alert('No he podido leer ese archivo: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }
};
