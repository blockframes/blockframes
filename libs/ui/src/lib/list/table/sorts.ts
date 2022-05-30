import { Organization } from '@blockframes/model';

export const sorts = {
  byOrgName: (a: Organization, b: Organization) => {
    const aName = a?.denomination.public || '--';
    const bName = b?.denomination.public || '--';
    if (aName < bName) return -1;
    if (aName > bName) return 1;
    return 0;
  },
  byDate: (a: string, b: string) => {
    const aDate = new Date(a).getTime() || 0;
    const bDate = new Date(b).getTime() || 0;
    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;
    return 0;
  },
  byNumber: (a: number = 0, b: number = 0) => {
    return a - b;
  }
}