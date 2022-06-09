import { Organization } from '@blockframes/model';

function defaultSorting(a: any, b: any, c: 'string' | 'number' | 'boolean') {
  if (c === 'string') return a.toUpperCase() > b.toUpperCase() ? 1 : -1;
  if (c === 'number') return a - b;
  if (c === 'boolean') {
    if (a && b) return 0;
    return a ? 1 : -1;
  }
}

export const sorts = {
  byOrgName: (a: Organization, b: Organization) => {
    const aName = a?.denomination.public || '--';
    const bName = b?.denomination.public || '--';
    return sorts.defaultSort(aName, bName);
  },
  byDate: (a: string, b: string) => {
    const aDate = new Date(a).getTime() || 0;
    const bDate = new Date(b).getTime() || 0;
    return sorts.defaultSort(aDate, bDate);
  },
  defaultSort: (a: any, b: any) => {
    if (typeof a === 'string' && typeof b === 'string') return defaultSorting(a, b, 'string');
    if (typeof a === 'number' && typeof b === 'number') return defaultSorting(a ?? 0, b ?? 0, 'number');
    if (typeof a === 'boolean' && typeof b === 'boolean') return defaultSorting(a, b, 'boolean');
    return 0;
  },
  defaultSortByOneValue: (a: any, b: any) => {
    if (a && !b) {
      const type = typeof a;
      if (type === 'string') return defaultSorting(a, '--', type);
      if (type === 'number') return defaultSorting(a, 0, type);
      if (type === 'boolean') return defaultSorting(a, false, type);
      return 0;
    }
    if (!a && b) {
      const type = typeof b;
      if (type === 'string') return defaultSorting('--', b, type);
      if (type === 'number') return defaultSorting(0, b, type);
      if (type === 'boolean') return defaultSorting(false, b, type);
      return 0;
    }
    return sorts.defaultSort(a, b);
  }
}
