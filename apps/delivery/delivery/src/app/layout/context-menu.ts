export const CONTEXT_MENU = [
  {route: 'default', items: [
    {name: 'home', path: '/layout/home'},
    {name: 'template', path: '/layout/template'},
  ]},
  {route: '/layout/:id', items: [
    {name: 'home', path: '/layout/home', exact: true},
    {name: 'view', path: '/layout/:id/movie-materials', exact: true},
    {name: 'list', path: '/layout/:id', exact: true}
  ]},
  {route: '/layout/home/form/:id', items: [
    {name: 'explorer', path: '/layout/home', exact: true},
    {name: 'view', path: '/layout/:id', exact: true},
    {name: 'edit', path: '/layout/home/form/:id/edit', exact: true}
  ]},
];
