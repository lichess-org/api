import { h } from 'snabbdom';

export default function colorpicker() {
  return h(
    'li.nav-item.colorpicker',
    h('input#colorpicker', {
      attrs: {
        type: 'color',
        value: localStorage.getItem('board.color') || defaultColor,
      },
      on: {
        input: e => setColor((e.target as HTMLInputElement).value),
      },
      hook: {
        insert: () => setColor(localStorage.getItem('board.color') || defaultColor),
      },
    })
  );
}

const defaultColor = '#b37c23';

const setColor = (color: string) => {
  document.body.style.setProperty('--board-color', color);
  localStorage.setItem('board.color', color);
};
