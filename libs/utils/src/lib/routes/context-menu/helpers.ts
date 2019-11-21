export type ContextMenu = {
  route: string;
  items: {
    name: string,
    path: string
  }[]
}[];

export function ctxMenu(contextMenu: ContextMenu) {
  return [  {
    route: 'default',
    items: []
  }, ...contextMenu];
}
