import { Organization } from '@blockframes/model';

export const sorts = {
  // #8355
  byOrgName: (a: Organization, b: Organization) => {
    if (!a?.denomination.public) return -1;
    if (!b?.denomination.public) return 1;
    return a?.denomination.public.localeCompare(b?.denomination.public);
  }
}
