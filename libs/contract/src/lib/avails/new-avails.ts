
import { Movie } from '@blockframes/movie/+state';
import { Media, territoriesISOA3, Territory, TerritoryISOA3 } from '@blockframes/utils/static-model';

import { BucketContract, BucketService } from '../bucket/+state';
import { BucketTerm, Term, TermService } from '../term/+state';
import { ContractService, Mandate, Sale } from '../contract/+state';


interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories: Territory[],
  exclusive: boolean
}

interface BucketContractWithId extends BucketContract {
  id: string;
}

interface BucketTermWithContractId extends BucketTerm {
  contractId: string;
}

function tinyId() {
  return Math.random().toString(16).substr(2);
}


// * SHOULD BE OK FOR DASHBOARD & MARKETPLACE TITLE LIST
async function availableTitles(avails: AvailsFilter, titles: Movie[], contractService: ContractService, termService: TermService, bucketService?: BucketService): Promise<Movie[]> {

  const titleIds = titles.map(t => t.id);


  // --------------------------
  // LEVEL ONE, KEEP TITLE BASED ON THEIR MANDATES

  const mandates = await Promise.all(titleIds.map(id =>
    contractService.getValue(ref => ref.where('titleId', '==', id)
      .where('type', '==', 'mandate')
      .where('status', '==', 'accepted')
    ) as Promise<Mandate[]>
  )).then(m => m.flat());
  const mandateTerms = await Promise.all(mandates.map(m =>
    termService.getValue(ref => ref.where('contractId', '==', m.id))
  )).then(t => t.flat());

  // get only the mandates that meets the avails filter criteria,
  // e.g. if we ask for "France" but the title is mandated in "Germany", we don't care
  // TODO implement core logic
  const availableMandateTerms = available(mandateTerms).basedOn(avails) as Term[];
  const availableMandates = mandates.filter(m => availableMandateTerms.map(t => t.contractId).includes(m.id));

  // keep only the titles from the available mandates
  const titleIds_levelOne = availableMandates.map(m => m.titleId);

  if (!titleIds_levelOne.length) return [];


  // --------------------------
  // LEVEL TWO, EXCLUDE LEVEL ONE TITLES BASED ON THEIR SALES

  const sales =  await Promise.all(titleIds_levelOne.map(id =>
    contractService.getValue(ref => ref.where('type', '==', 'sale')
      .where('titleId', '==', id)
      .where('status', '==', 'accepted')
    ) as Promise<Sale[]>
  )).then(s => s.flat());
  const saleTerms = await Promise.all(sales.map(s =>
    termService.getValue(ref => ref.where('contractId', '==', s.id))
  )).then(t => t.flat());

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  // TODO implement core logic
  const saleTermsToExclude = alreadySold(saleTerms).basedOn(avails) as Term[];
  const salesToExclude = sales.filter(s => saleTermsToExclude.map(t => t.contractId).includes(s.id));

  // remove the titles which are already sold
  const titleIds_levelTwo = titleIds_levelOne.filter(id => !salesToExclude.map(s => s.titleId).includes(id));

  if (!titleIds_levelTwo.length) return [];


  // --------------------------
  // LEVEL THREE, EXCLUDE LEVEL TWO TITLES BASED ON THE BUCKET
  // i.e. we don't want a user to put the same title twice in his shopping cart

  // on the dashboard side of the app there is no bucket, so we can stop here
  if (!bucketService) return titles.filter(t => titleIds_levelTwo.includes(t.id));

  const userBucket = await bucketService.getActive();

  const bucketSales = userBucket.contracts.map(s => ({ ...s, id: tinyId() })) as BucketContractWithId[];
  const bucketSaleTerms = bucketSales.map(s => s.terms.map(t => ({ ...t, contractId: s.id }))).flat() as BucketTermWithContractId[];

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  // TODO implement core logic
  const bucketSaleTermsToExclude = alreadySold(bucketSaleTerms).basedOn(avails) as BucketTermWithContractId[];
  const bucketSalesToExclude = bucketSales.filter(s => bucketSaleTermsToExclude.map(t => t.contractId).includes(s.id));

  // remove the titles which are already sold
  const titleIds_levelThree = titleIds_levelTwo.filter(id => !bucketSalesToExclude.map(s => s.titleId).includes(id));


  // --------------------------

  return titles.filter(t => titleIds_levelThree.includes(t.id));
}

