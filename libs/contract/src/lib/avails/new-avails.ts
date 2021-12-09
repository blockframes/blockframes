
import { Movie } from '@blockframes/movie/+state';
import { Media, Territory } from '@blockframes/utils/static-model';

import { allOf, noneOf } from './sets';
import { BucketTerm, Term } from '../term/+state';
import { Mandate, Sale } from '../contract/+state';
import { Bucket, BucketContract } from '../bucket/+state';

interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories: Territory[],
  exclusive: boolean
}

interface FullMandate extends Mandate {
  terms: Term[];
}

interface FullSale extends Sale {
  terms: Term[];
}

interface BucketTermWithContractId extends BucketTerm {
  contractId: string;
}

interface BucketContractWithId extends BucketContract {
  id: string;
  terms: BucketTermWithContractId[]
}

function tinyId() {
  return Math.random().toString(16).substr(2);
}

function mandateExclusivityCheck(term: Term, avails: AvailsFilter) {

  //                                Avail
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ✅    |       ✅     |
  // Mandate        -----|-----------|---------------|
  //       Non-Exclusive |    ❌     |      ✅      |
  //                -----|-----------|---------------|

  return term.exclusive || !avails.exclusive;
}

function getMatchingMandates(mandates: FullMandate[], avails: AvailsFilter): FullMandate[] {
  return mandates.filter(mandate => mandate.terms.some(term => {
    const exclusivityCheck = mandateExclusivityCheck(term, avails);
    const mediaCheck = allOf(avails.medias).in(term.medias);
    const durationCheck = allOf(avails.duration).in(term.duration);
    const territoryCheck = allOf(avails.territories).in(term.territories);

    return exclusivityCheck && mediaCheck && durationCheck && territoryCheck;
  }));
}


function saleExclusivityCheck(term: Term, avails: AvailsFilter) {

  //                                Avail
  //                     | Exclusive | Non-Exclusive |
  //                -----|-----------|---------------|
  //           Exclusive |     ❌    |       ❌     |
  // Sale           -----|-----------|---------------|
  //       Non-Exclusive |    ❌     |      ✅      |
  //                -----|-----------|---------------|

  return !term.exclusive && !avails.exclusive;
}

function getMatchingSales<T extends (FullSale | BucketContractWithId)>(sales: T[], avails: AvailsFilter): T[] {
  return sales.filter(sale => sale.terms.some(term => {
    const exclusivityCheck = saleExclusivityCheck(term ,avails);
    const mediaCheck = noneOf(avails.medias).in(term.medias);
    const durationCheck = noneOf(avails.duration).in(term.duration);
    const territoryCheck = noneOf(avails.territories).in(term.territories);

    return !(exclusivityCheck || mediaCheck || durationCheck || territoryCheck);
  }));
}

function availableTitles(
  avails: AvailsFilter,
  titles: Movie[],
  mandates: FullMandate[],
  sales: FullSale[],
  bucket?: Bucket,
): Movie[] {
  return titles.filter(title => {
    const titleSales = sales.filter(s => s.titleId === title.id);
    const titleMandates = mandates.filter(m => m.titleId === title.id);

    return availableTitle(avails, titleMandates, titleSales, bucket);
  });
}


function availableTitle(
  avails: AvailsFilter,
  mandates: FullMandate[],
  sales: FullSale[],
  bucket?: Bucket,
): boolean {

  if (!mandates.length) return false;

  // check that the mandates & sales are about one single title,
  // i.e. they must all have the same `titleId`
  const titleId = mandates[0].titleId;
  const invalidMandate = mandates.some(m => m.titleId !== titleId);
  const invalidSale = sales.some(s => s.titleId !== titleId);

  if (invalidMandate || invalidSale) throw new Error('Mandates & Sales must all have the same title id!');


  // get only the mandates that meets the avails filter criteria,
  // e.g. if we ask for "France" but the title is mandated in "Germany", we don't care
  const availableMandates = getMatchingMandates(mandates, avails);

  // if there is no mandates left, the title is not available
  if (!availableMandates.length) return false;

  // else we should now check the sales

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const salesToExclude = getMatchingSales(sales, avails);

  // if there is at least one sale that match the avails, the title is not available
  if (salesToExclude.length) return false;

  // else we should check the bucket (if we have one)

  // for now the title is available and we have no bucket to check
  if (!bucket) return true;

  // we retrieve the sales from the bucket,
  // but we also format everything, adding a fake tiny id so that we can easily find back what we need
  // i.e. `term -(contractId)-> sale -(titleId)-> title`
  const bucketSales = bucket.contracts.map(s => {
    const id = tinyId();
    const terms: BucketTermWithContractId[] = s.terms.map(t => ({ ...t, contractId: id}));

    return { ...s, id, terms } as BucketContractWithId;
  });

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  const bucketSalesToExclude = getMatchingSales(bucketSales, avails);

  // if there is at least one sale that match the avails, the title is not available
  if (bucketSalesToExclude.length) return false;

  return true;
}
