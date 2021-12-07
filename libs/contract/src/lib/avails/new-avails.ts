
import { Movie } from '@blockframes/movie/+state';
import { Media, territories, Territory } from '@blockframes/utils/static-model';

import { BucketService } from '../bucket/+state';
import { ContractService, Mandate, Sale } from '../contract/+state';


interface AvailsFilter {
  medias: Media[],
  duration: { from: Date, to: Date },
  territories: Territory[],
  exclusive: boolean
}

// * SHOULD BE OK FOR DASHBOARD & MARKETPLACE TITLE LIST
async function availableTitles(avails: AvailsFilter, titles: Movie[], contractService: ContractService, bucketService?: BucketService) {

  const titleIds = titles.map(t => t.id);


  // --------------------------
  // LEVEL ONE, KEEP TITLE BASED ON THEIR MANDATES

  // TODO we need the terms instead of the mandates
  const mandates = await Promise.all(titleIds.map(id =>
    contractService.getValue(ref => ref.where('type', '==', 'mandate')
      .where('titleId', '==', id)
      .where('status', '==', 'accepted')
    ) as Promise<Mandate[]>
  )).then(m => m.flat());

  // get only the mandates that meets the avails filter criteria,
  // e.g. if we ask for "France" but the title is mandated in "Germany", we don't care
  // TODO implement core logic
  const availableMandates = includes(mandates).basedOn(avails) as Mandate[];

  // keep only the titles from the available mandates
  const titleIds_levelOne = availableMandates.map(m => m.titleId);


  // --------------------------
  // LEVEL TWO, EXCLUDE LEVEL ONE TITLES BASED ON THEIR SALES

  // TODO we need the terms instead of the sales
  const sales =  await Promise.all(titleIds_levelOne.map(id =>
    contractService.getValue(ref => ref.where('type', '==', 'sale')
      .where('titleId', '==', id)
      .where('status', '==', 'accepted')
    ) as Promise<Sale[]>
  )).then(s => s.flat());

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  // TODO implement core logic
  const salesToExclude = excludes(sales).basedOn(avails) as Sale[];

  // remove the titles which are already sold
  const titleIds_levelTwo = titleIds_levelOne.filter(id => !salesToExclude.map(s => s.titleId).includes(id));


  // --------------------------
  // LEVEL THREE, EXCLUDE LEVEL TWO TITLES BASED ON THE BUCKET
  // i.e. we don't want a user to put the same title twice in his shopping cart

  // on the dashboard side of the app there is no bucket, so we can stop here
  if (!bucketService) return titles.filter(t => titleIds_levelTwo.includes(t.id));

  const userBucket = await bucketService.getActive();

  // TODO we need the terms instead of the sales
  const bucketSales = userBucket.contracts;

  // get only the sales that meets the avails filter criteria
  // e.g. if we ask for "France" but the title has been sold in "Germany", we don't care
  // TODO implement core logic
  const bucketSalesToExclude = excludes(bucketSales).basedOn(avails) as Sale[];

  // remove the titles which are already sold
  return titleIds_levelTwo.filter(id => !bucketSalesToExclude.map(s => s.titleId).includes(id));
}



