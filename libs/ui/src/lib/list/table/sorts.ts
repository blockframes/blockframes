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
  defaultSort: (a: any, b: any) => {
    if (typeof a === 'string' && typeof b === 'string') return a.toUpperCase() > b.toUpperCase() ? 1 : -1;
    if (typeof a === 'number' && typeof b === 'number') return (a ?? 0) - (b ?? 0);
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      if (a && b) return 0;
      return a ? 1 : -1;
    }
    return 0;
  }
}
