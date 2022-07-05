import { Organization } from '@blockframes/model';

export const sorts = {
  byOrgName: (a: Organization, b: Organization) => {
    if (!a.name) return -1;
    if (!b.name) return 1;
    return a.name.localeCompare(b.name);
  }
}
