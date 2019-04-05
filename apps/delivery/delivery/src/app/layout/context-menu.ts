export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [{ name: 'home', path: '/layout/home' }, { name: 'template', path: '/layout/template' }]
  },
  {
    route: '/layout/:id',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'view', path: '/layout/:id/movie-materials'},
      { name: 'list', path: '/layout/:id'}
    ]
  },
  {
    route: '/layout/:mid/form/:did',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'form', path: '/layout/:id/form'},
      { name: 'view', path: '/layout/:id/view'}
    ]
  }
];
