import { metaDoc } from "@blockframes/utils/maintenance";

export const permissionsFixtures = {
  // Meta
  [metaDoc]: {
    startedAt: new Date(),
    endedAt: null
  },

  // Permission
  'permissions/O001': {
    id: 'O001',
    roles: { }
  },

  'permissions/O001/documentPermissions/D001': {
    id: 'D001',
    ownerId: 'O001',
  },


};