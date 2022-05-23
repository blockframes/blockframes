import { RouteDescription } from '@blockframes/model';

export const artisticRoute: RouteDescription = {
  path: 'artistic',
  label: 'Artistic',
  requireKeys: ['cast', 'crew', 'promotional.notes'],
}