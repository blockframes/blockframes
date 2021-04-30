import { FormControl } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { Territory } from '@blockframes/utils/static-model';
import { findSameTermIndex } from '../avails/avails';
import { AvailsForm } from '../avails/form/avails.form';
import { Term } from '../term/+state';
import { Mandate } from '../contract/+state';
import { Bucket, BucketContract, toBucketContract, toBucketTerm } from './+state/bucket.model';

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

  /**
   * Find the 
   * @param mandate 
   * @param term 
   * @param territory 
   * @returns 
   */
  toggleTerritory(mandate: Mandate, term: Term, territory: Territory) {
    const bucket = this.value;
    const contractIndex = bucket.contracts.findIndex(contract => contract.parentTermId === mandate.parentTermId);
    // Contract is not registered
    if (contractIndex === -1) {
      const contract = toBucketContract(mandate, [term]);
      this.get('contracts').add(contract);
      return;
    }
    const contract = bucket.contracts[contractIndex];
    const termIndex = findSameTermIndex(contract.terms, term);
    // New term
    if (termIndex === -1) {
      this.get('contracts').at(contractIndex).get('terms').add(toBucketTerm(term));
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
    }
  }
}