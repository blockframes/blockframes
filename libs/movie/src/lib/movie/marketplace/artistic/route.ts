import { RouteDescription } from "@blockframes/utils/common-interfaces";

export const artisticRoute: RouteDescription = {
  path: 'artistic',
  label: 'Artistic',
  requireKeys: ['cast', 'crew', 'promotional.notes'],
}