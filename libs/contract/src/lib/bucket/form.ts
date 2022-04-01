import { FormControl, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { FormEntity, FormList, FormStaticValueArray } from '@blockframes/utils/form';
import { MovieVersionInfoForm, createLanguageControl } from '@blockframes/movie/form/movie.form';

import {
  Bucket,
  BucketContract,
  createBucket,
  createBucketContract,
  createBucketTerm,
  Mandate,
  BucketTerm,
  Term,
} from '@blockframes/shared/model';
import {
  AvailableTerritoryMarker,
  AvailsFilter,
  BucketTerritoryMarker,
  CalendarAvailsFilter,
  DurationMarker,
  isSameBucketContract,
  isSameCalendarBucketTerm,
  isSameMapBucketTerm,
  MapAvailsFilter,
} from '../avails/avails';
import { HoldbackForm } from '../contract/holdback/form';

//////////
// TERM //
//////////
export function createBucketTermControl(params: Partial<BucketTerm> = {}) {
  const term = createBucketTerm(params);
  return {
    territories: new FormStaticValueArray<'territories'>(term.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(term.medias, 'medias'),
    exclusive: new FormControl(term.exclusive ?? true),
    duration: new FormGroup({
      from: new FormControl(term.duration?.from),
      to: new FormControl(term.duration?.to),
    }),
    languages: MovieVersionInfoForm.factory(term.languages, createLanguageControl),
  };
}

type BucketTermControl = ReturnType<typeof createBucketTermControl>;

export class BucketTermForm extends FormEntity<BucketTermControl, BucketTerm> {
  constructor(term: Partial<BucketTerm> = {}) {
    const control = createBucketTermControl(term);
    super(control);
  }
}

//////////////
// CONTRACT //
//////////////

function createBucketContractControl(params: Partial<BucketContract> = {}) {
  const contract = createBucketContract(params);
  return {
    titleId: new FormControl(contract.titleId),
    orgId: new FormControl(contract.orgId),
    price: new FormControl(contract.price),
    parentTermId: new FormControl(contract.parentTermId),
    terms: FormList.factory(contract.terms, term => BucketTermForm.factory(term, createBucketTermControl)),
    specificity: new FormControl(contract.price),
    holdbacks: FormList.factory(contract.holdbacks, holdback => new HoldbackForm(holdback), []),
  };
}
type BucketContractControls = ReturnType<typeof createBucketContractControl>;

class BucketContractForm extends FormEntity<BucketContractControls, BucketContract> {
  constructor(contract: Partial<BucketContract> = {}) {
    const controls = createBucketContractControl(contract);
    super(controls);
  }
}

////////////
// BUCKET //
////////////

function toBucketTerm(avail: AvailsFilter | MapAvailsFilter | CalendarAvailsFilter): BucketTerm {
  return createBucketTerm({
    medias: avail.medias,
    duration: 'duration' in avail ? avail.duration : undefined,
    territories: 'territories' in avail ? avail.territories : undefined,
    exclusive: avail.exclusive,
  });
}

function toBucketContract(
  contract: Mandate,
  term: Term<Date>,
  avails: AvailsFilter | MapAvailsFilter | CalendarAvailsFilter
): BucketContract {
  return createBucketContract({
    titleId: contract.titleId,
    orgId: contract.sellerId,
    parentTermId: term.id,
    terms: [toBucketTerm(avails)],
  });
}

function createBucketControl(params: Partial<Bucket> = {}) {
  const bucket = createBucket(params);
  return {
    currency: new FormControl(bucket.currency),
    contracts: FormList.factory(bucket.contracts, contract => new BucketContractForm(contract)),
  };
}

type BucketControls = ReturnType<typeof createBucketControl>;

export class BucketForm extends FormEntity<BucketControls, Bucket> {
  change: Subject<void>;
  constructor(bucket: Partial<Bucket> = {}) {
    const controls = createBucketControl(bucket);
    super(controls);
    this.createControl = createBucketControl;
    this.change = new Subject();
  }

  selectTerms(titleId: string) {
    const getTerm = () =>
      this.get('contracts')
        .controls.filter(contract => contract.value.titleId === titleId)
        .map(contract => contract.get('terms'))
        .flat()
        .map(terms => terms.controls)
        .flat();

    return this.change.pipe(startWith([]), map(getTerm));
  }

  /**
   * Adds a territory to bucket if not already in it
   * @param avails
   * @param marker
   * @returns
   */
  addTerritory(avails: MapAvailsFilter, marker: AvailableTerritoryMarker): boolean {
    const { contract: mandate, slug: territory, term } = marker;
    const bucket = this.value;
    const contractIndex = bucket.contracts.findIndex(c => c.parentTermId === term.id);

    // Contract is not registered
    if (contractIndex === -1) {
      this.get('contracts').add(toBucketContract(mandate, term, { ...avails, territories: [territory] }));
      this.markAsDirty();
      this.change.next();
      return true;
    }

    const contract = bucket.contracts[contractIndex];
    const termIndex = contract.terms.findIndex(t => isSameMapBucketTerm(avails, t));

    // New term
    if (termIndex === -1) {
      this.get('contracts')
        .at(contractIndex)
        .get('terms')
        .add(toBucketTerm({ ...avails, territories: [territory] }));
      this.markAsDirty();
      this.change.next();
      return true;
    }

    const territories = contract.terms[termIndex].territories;
    const control = this.get('contracts').at(contractIndex).get('terms').at(termIndex).get('territories');
    const hasTerritory = territories.includes(territory);
    // Add territory
    if (!hasTerritory) {
      control.setValue([...territories, territory]);
      this.markAsDirty();
      return true;
    }
    return false;
  }

  /**
   * Removes a territory from Bucket and entire term if empty
   * @param avails
   * @param marker
   * @returns
   */
  removeTerritory(avails: MapAvailsFilter, marker: BucketTerritoryMarker) {
    const { slug: territory, contract: bucketContract } = marker;
    const bucket = this.value;
    const contractIndex = bucket.contracts.findIndex(c => isSameBucketContract(c, bucketContract));
    if (contractIndex === -1) return;

    const contract = bucket.contracts[contractIndex];
    const termIndex = contract.terms.findIndex(t => isSameMapBucketTerm(avails, t));
    if (termIndex === -1) return;

    const territories = contract.terms[termIndex].territories;
    const control = this.get('contracts').at(contractIndex).get('terms').at(termIndex).get('territories');
    const hasTerritory = territories.includes(territory);

    if (!hasTerritory) return;

    if (territories.length > 1) {
      control.setValue(territories.filter(t => t !== territory));
    } else {
      // Remove the term as it was the last territory
      this.get('contracts').at(contractIndex).get('terms').removeAt(termIndex);
      this.change.next();
    }
  }

  /**
   * Checks if a territory is already in bucket
   * @param avails
   * @param marker
   * @returns boolean
   */
  isAlreadyInBucket(avails: MapAvailsFilter, marker: AvailableTerritoryMarker): boolean {
    const { slug: territory, term } = marker;

    const bucket = this.value;
    const contractIndex = bucket.contracts.findIndex(c => c.parentTermId === term.id);
    if (contractIndex === -1) return false;
    const contract = bucket.contracts[contractIndex];
    const termIndex = contract.terms.findIndex(t => isSameMapBucketTerm(avails, t));
    if (termIndex === -1) return false;
    const territories = contract.terms[termIndex].territories;
    return territories.includes(territory);
  }

  /**
   * Adds a Duration from Calendar into the bucket if not already in it
   */
  addDuration(avails: CalendarAvailsFilter, marker: DurationMarker) {
    const { contract: mandate, term, from, to } = marker;
    const bucket = this.value;
    const contractIndex = bucket.contracts.findIndex(c => c.parentTermId === term.id);

    const availsWithDuration = { ...avails, duration: { from, to } };

    // Contract is not registered
    if (contractIndex === -1) {
      const bucketContract = toBucketContract(mandate, term, availsWithDuration);
      this.get('contracts').add(bucketContract);
      this.markAsDirty();
      this.change.next();
      return;
    }

    const bucketTerm = toBucketTerm(availsWithDuration);
    this.get('contracts').at(contractIndex).get('terms').add(bucketTerm);
    this.markAsDirty();
    this.change.next();
  }

  /**
   * This function will retrieved the `termIndex` & `contractIndex` based on the given `DurationMarker`
   */
  getTermIndexForCalendar(
    avails: CalendarAvailsFilter,
    marker: DurationMarker
  ): { contractIndex: number; termIndex: number } | undefined {
    const { term } = marker;
    const bucket = this.value;

    const contractIndex = bucket.contracts.findIndex(c => c.parentTermId === term.id);
    if (contractIndex === -1) return;

    const contract = bucket.contracts[contractIndex];
    const termIndex = contract.terms.findIndex(t => isSameCalendarBucketTerm(avails, t));
    if (termIndex === -1) return;

    return { contractIndex, termIndex };
  }
}
