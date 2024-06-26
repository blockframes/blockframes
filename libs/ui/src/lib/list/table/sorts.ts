import { MovieVideos, Organization, Duration, contractPrice, WaterfallInvestment } from '@blockframes/model';

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
  byDuration: (a: Duration, b: Duration) => {
    if (a.to.getTime() > b.to.getTime()) return 1;
    if (a.to.getTime() < b.to.getTime()) return -1;
    return 0;
  },
  byContractPrice: (a: WaterfallInvestment[], b: WaterfallInvestment[]) => {
    const aPrice = contractPrice({ price: a });
    const bPrice = contractPrice({ price: b });
    if (aPrice > bPrice) return 1;
    if (aPrice < bPrice) return -1;
    return 0;
  }
}
