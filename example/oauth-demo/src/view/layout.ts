import { h, VNode } from 'snabbdom';
import { Me } from '../auth';
import { Ctrl } from '../ctrl';
import { MaybeVNodes } from '../interfaces';
import colorpicker from './colorpicker';

export default function (ctrl: Ctrl, body: MaybeVNodes): VNode {
  return h('body', [renderNavBar(ctrl), h('div.container', body)]);
}

const renderNavBar = (ctrl: Ctrl) =>
  h('header.navbar.navbar-expand-lg.navbar-dark.bg-dark', [
    h('div.container', [
      h(
        'a.navbar-brand',
        {
          attrs: { href: '/' },
        },
        'Lichess API Demo'
      ),
      h(
        'button.navbar-toggler',
        {
          attrs: {
            type: 'button',
            'data-bs-toggle': 'collapse',
            'data-bs-target': '#navbarSupportedContent',
            'aria-controls': 'navbarSupportedContent',
            'aria-expanded': false,
            'aria-label': 'Toggle navigation',
          },
        },
        h('span.navbar-toggler-icon')
      ),
      h('div#navbarSupportedContent.collapse.navbar-collapse', [
        h('ul.navbar-nav', [colorpicker(), ctrl.auth.me ? userNav(ctrl.auth.me) : anonNav()]),
      ]),
    ]),
  ]);

const userNav = (me: Me) =>
  h('li.nav-item.dropdown', [
    h(
      'a#navbarDropdown.nav-link.dropdown-toggle',
      {
        attrs: {
          href: '#',
          role: 'button',
          'data-bs-toggle': 'dropdown',
          'aria-expanded': false,
        },
      },
      me.username
    ),
    h(
      'ul.dropdown-menu',
      {
        attrs: {
          'aria-labelledby': 'navbarDropdown',
        },
      },
      [
        h(
          'li',
          h(
            'a.dropdown-item',
            {
              attrs: { href: '/logout' },
            },
            'Log out'
          )
        ),
      ]
    ),
  ]);

const anonNav = () =>
  h(
    'li.nav-item',
    h(
      'a.btn.btn-primary.text-nowrap',
      {
        attrs: { href: '/login' },
      },
      'Login with Lichess'
    )
  );
