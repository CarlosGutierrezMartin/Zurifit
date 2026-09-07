export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Delegación de eventos: on(root, 'click', '[data-x]', (ev, el) => ...)
export function on(root, type, selector, handler) {
  root.addEventListener(type, ev => {
    const el = ev.target.closest(selector);
    if (el && root.contains(el)) handler(ev, el);
  });
}

export function html(strings, ...values) {
  return strings.reduce((out, s, i) => out + s + (values[i] ?? ''), '');
}

// Cada vista se monta en un contenedor nuevo: así los listeners de la vista
// anterior desaparecen con su DOM y no se acumulan entre repintados.
export function mount(container, markup) {
  const view = document.createElement('div');
  view.className = 'view';
  view.innerHTML = markup;
  container.replaceChildren(view);
  window.scrollTo(0, 0);
  return view;
}
