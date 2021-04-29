import { FormControl } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { Territory } from '@blockframes/utils/static-model';
import { AvailsFilter, findSameAvailIndex } from '../avails/avails';
import { AvailsForm } from '../avails/form/avails.form';
import { Term } from '../term/+state';
import { Bucket, BucketContract, createBucketContract, fromTermToAvail } from './+state/bucket.model';

//////////////
// CONTRACT //
//////////////

function createBucketContractControl(contract: Partial<BucketContract> = {}) {
  return {
    titleId: new FormControl(contract.titleId),
    orgId:  new FormControl(contract.orgId),
    price: new FormControl(contract.price),
    parentTermId: new FormControl(contract.parentTermId),
    terms: FormList.factory(contract.terms, term => new AvailsForm(term)),
    specificity: new FormControl(contract.price),
  }
}
type BucketContractControls = ReturnType<typeof createBucketContractControl>;


class BucketContractForm extends FormEntity<BucketContractControls, BucketContract> {
  constructor(contract: Partial<BucketContract> = {}) {
    const controls = createBucketControl(contract);
    super(controls);
  }
}



////////////
// BUCKET //
////////////

function createBucketControl(bucket: Partial<Bucket> = {}) {
  return {
    currency: new FormControl(bucket.currency),
    contracts: FormList.factory(bucket.contracts, (contract) => new BucketContractForm(contract))
  }
}

type BucketControls = ReturnType<typeof createBucketControl>;

export class BucketForm extends FormEntity<BucketControls, Bucket> {
  constructor(bucket: Partial<Bucket> = {}) {
    const controls = createBucketControl(bucket);
    super(controls);
  }

  toggleTerritory(parentTermId: string, term: Term, territory: Territory) {
    const bucket = this.value;
    const index = bucket.contracts.findIndex(contract => contract.parentTermId === parentTermId);
    if (index !== -1) {
      const contract = bucket.contracts[index];
      const availIndex = findSameAvailIndex(contract.terms, term);
      if (availIndex !== -1) {
        const hasTerritory = contract.terms[availIndex].territories.includes(territory);
        const territories = hasTerritory
          ? contract.terms[availIndex].territories.filter(t => t !== territory)
          : [...contract.terms[availIndex].territories, territory];
        this.get('contracts').at(index).get('terms').at(availIndex).get('territories').setValue(territories);
      } else {
        this.get('contracts').at(index).get('terms').add(fromTermToAvail(term));
      }
    } else {
      const terms = [fromTermToAvail(term)];
      const contract = createBucketContract({ parentTermId, terms });
      this.get('contracts').add(contract);
    }
    
  }
}