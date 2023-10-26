import { MovieVideos, Organization, PricePerCurrency, sum } from '@blockframes/model';

export const sorts = {
  byOrgName: (a: Organization, b: Organization) => {
    if (!a.name) return -1;
    if (!b.name) return 1;
    return a.name.localeCompare(b.name);
  },
  byScreener: (a: MovieVideos, b: MovieVideos) => {
    const aHasScreener = a.publicScreener.docId || a.screener.docId;
    const bHasScreener = b.publicScreener.docId || b.screener.docId;
    if (!aHasScreener) return -1;
    if (!bHasScreener) return 1;
    return aHasScreener.localeCompare(bHasScreener);
  },
  byLength: (a: unknown[], b: unknown[]) => {
    if (a.length > b.length) return 1;
    if (a.length < b.length) return -1;
    return 0;
  },
  byPriceCurrency: (_a: PricePerCurrency, _b: PricePerCurrency) => {
    const a = sum(Object.values(_a));
    const b = sum(Object.values(_b));
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  }
}
