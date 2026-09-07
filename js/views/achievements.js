import { evaluate, CATEGORIES } from '../data/achievements.js';
import { getState, firstName } from '../store.js';
import { esc } from '../lib/dom.js';
import * as S from '../stats.js';

export default {
  render() {
    const stats = S.globalStats();
    const list = evaluate(stats);
    const unlockedAt = getState().achievements;
    const got = list.filter(a => a.unlocked).length;

    return `
    <header class="topbar topbar--simple"><h1>Logros</h1><span class="pill">${got}/${list.length}</span></header>

    <div class="pad pad--flush">
      <section class="card card--level">
        <div class="level">
          <span class="level__emoji">${stats.level.emoji}</span>
          <div class="level__body">
            <p class="level__name">Nivel ${stats.level.index} · ${esc(stats.level.name)}</p>
            <div class="bar"><span class="bar__fill" style="width:${stats.level.pct.toFixed(0)}%"></span></div>
            <p class="level__hint">${S.fmtBig(stats.level.xp)} puntos${stats.level.next
              ? ` · faltan ${S.fmtBig(stats.level.next - stats.level.xp)} para ${esc(stats.level.nextName)}` : ''}</p>
          </div>
        </div>
        <p class="card__meta">Los puntos suben con cada entreno, cada récord, cada kilo movido y cada minuto de cardio.</p>
      </section>

      ${CATEGORIES.map(cat => `
        <section class="ach-group">
          <h3 class="section-title">${esc(cat)}</h3>
          <div class="ach-grid">
            ${list.filter(a => a.cat === cat).map(a => `
              <article class="ach${a.unlocked ? ' is-on' : ''}">
                <span class="ach__emoji">${a.emoji}</span>
                <div class="ach__body">
                  <b>${esc(a.name)}</b>
                  <small>${esc(a.desc)}</small>
                  ${a.unlocked
                    ? `<span class="ach__date">Conseguido${unlockedAt[a.id] ? ` el ${esc(S.fmtDate(unlockedAt[a.id].slice(0, 10)))}` : ''}</span>`
                    : `<div class="bar bar--thin"><span class="bar__fill" style="width:${a.pct.toFixed(0)}%"></span></div>
                       <span class="ach__prog">${S.fmtBig(a.current)} / ${S.fmtBig(a.target)}</span>`}
                </div>
              </article>`).join('')}
          </div>
        </section>`).join('')}

      <p class="closing">Y el logro más importante, ${esc(firstName())}, ya lo tienes: aparecer. 💗</p>
    </div>`;
  }
};
