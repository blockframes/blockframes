import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity, FormList, FormStaticValueArray } from '@blockframes/utils/form';
import { Territory } from '@blockframes/utils/static-model';
import { MovieVersionInfoForm, createLanguageControl } from '@blockframes/movie/form/movie.form';
import { findSameTermIndex } from '../avails/avails';
import { Term } from '../term/+state';
import { Mandate } from '../contract/+state';
import { Bucket, BucketContract, BucketTerm, createBucket, createBucketContract, createBucketTerm, toBucketContract, toBucketTerm } from './+state/bucket.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

//////////
// TERM //
//////////
function createBucketTermControl(params: Partial<BucketTerm> = {}) {
  const term = createBucketTerm(params);
  return {
    territories: new FormStaticValueArray<'territories'>(term.territories, 'territories'),
    medias: new FormStaticValueArray<'medias'>(term.medias, 'medias'),
    exclusive: new FormControl(term.exclusive ?? true),
    duration: new FormGroup({
      from: new FormControl(term.duration?.from),
      to: new FormControl(term.duration?.to)
    }),
    languages: MovieVersionInfoForm.factory(term.languages, createLanguageControl),
    runs: new FormGroup({
      broadcasts: new FormControl(term.runs?.broadcasts),
      catchup: new FormGroup({
        from: new FormControl(term.runs?.catchup.from),
        duration: new FormControl(term.runs?.catchup.duration),
        period: new FormControl(term.runs?.catchup.period),
      }),
    })
  }
}

type BucketTermControl = ReturnType<typeof createBucketTermControl>

export class BucketTermForm extends FormEntity<BucketTermControl, BucketTerm> {
  constructor(term: Partial<BucketTerm> = {}) {
    super(createBucketTermControl(term))
  }
}

//////////////
// CONTRACT //
//////////////

function createBucketContractControl(params: Partial<BucketContract> = {}) {
  const contract = createBucketContract(params);
  return {
    titleId: new FormControl(contract.titleId),
    orgId:  new FormControl(contract.orgId),
    price: new FormControl(contract.price),
    parentTermId: new FormControl(contract.parentTermId),
    terms: FormList.factory(contract.terms, term => new BucketTermForm(term)),
    specificity: new FormControl(contract.price),
  }
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

function createBucketControl(params: Partial<Bucket> = {}) {
  const bucket = createBucket(params);
  return {
    currency: new FormControl(bucket.currency),
    contracts: FormList.factory(bucket.contracts, (contract) => new BucketContractForm(contract))
  }
}

type BucketControls = ReturnType<typeof createBucketControl>;

export class BucketForm extends FormEntity<BucketControls, Bucket> {
  change: Subject<void>;
  constructor(bucket: Partial<Bucket> = {}) {
    const controls = createBucketControl(bucket);
    super(controls);
    super.createControl = createBucketControl;
    this.change = new Subject();
  }

  selectTerms(titleId: string) {
    const getTerm = () => this.get('contracts').controls
      .filter(contract => contract.value.titleId === titleId)
      .map(contract => contract.get('terms'))
      .flat()
      .map(terms => terms.controls)
      .flat();

    return this.change.pipe(map(getTerm));
  }

  /**
   * Find the
   * @param mandate
   * @param term
   * @param territory
   * @returns
   */
  toggleTerritory(mandate: Mandate, term: Term, territory: Territory) {
    const bucket = this.value;
    const contractIndex = bucket.contracts.findIndex(c => c.parentTermId === mandate.parentTermId);
    // Contract is not registered
    if (contractIndex === -1) {
      this.get('contracts').add(toBucketContract(mandate, [term]));
      this.change.next();
      return;
    }
    const contract = bucket.contracts[contractIndex];
    const termIndex = findSameTermIndex(contract.terms, term);
    // New term
    if (termIndex === -1) {
      this.get('contracts').at(contractIndex).get('terms').add(toBucketTerm(term));
      this.change.next();
      return;
    }
    // Toggle territory
    const territories = contract.terms[termIndex].territories;
    const control = this.get('contracts').at(contractIndex).get('terms').at(termIndex).get('territories');
    const hasTerritory = territories.includes(territory);
    // Add territory
    if (!hasTerritory) {
      control.setValue([...territories, territory]);
    }
    // Remove the territory from the list
    else if (territories.length > 1) {
      control.setValue(territories.filter(t => t !== territory));
    }
    // Remove the term as it was the last territory
    else {
      this.get('contracts').at(contractIndex).get('terms').removeAt(termIndex);
      this.change.next();
    }
  }
}
