import { Organization } from '@blockframes/model';

function sorting(a: any, b: any, c: 'string' | 'number' | 'boolean') {
  switch(c) {
    case 'string':
      return a.toUpperCase() > b.toUpperCase() ? 1 : -1;
    case 'number':
      return a - b;
    case 'boolean':
      if (a && b) return 0;
      return a ? 1 : -1;
    default:
      return 0;
  }
}

export const sorts = {
  // #8355
  byOrgName: (a: Organization, b: Organization) => {
    const aName = a?.denomination.public || '--';
    const bName = b?.denomination.public || '--';
    return sorts.defaultSort(aName, bName);
  },
  defaultSort: (a: any, b: any) => {
    if (a instanceof Date && b instanceof Date) return sorting(a.getTime() || 0, b.getTime() || 0, 'number');
    if (typeof a === 'number' && typeof b === 'number') return sorting(a ?? 0, b ?? 0, 'number');
    if (typeof a === 'string' && typeof b === 'string') return sorting(a, b, 'string');
    if (typeof a === 'boolean' && typeof b === 'boolean') return sorting(a, b, 'boolean');
    if (!a) return 1;
    if (!b) return -1
    return 0;
  }
}
