import { FormControl } from "@angular/forms";
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { Bucket, BucketContract, createBucket, createBucketContract } from '../+state/bucket.model';

function createBucketContractControl(params: Partial<BucketContract>) {
  const contract = createBucketContract(params);
  return {
    titleId: new FormControl(contract.titleId),
    orgId: new FormControl(contract.orgId),
    price: new FormControl(contract.price),
    parentTermId: new FormControl(contract.parentTermId),
    terms: FormList.factory(contract.terms, el => new FormControl(el)),
    specificity: new FormControl(contract.specificity)
  }
}

export type BucketContractControl = ReturnType<typeof createBucketContractControl>

export class BucketContractForm extends FormEntity<BucketContractControl> {
  constructor(contract: Partial<BucketContract>) {
    super(createBucketContractControl(contract))
  }

  get price() { return this.get('price') }
  get titleId() { return this.get('titleId') }
  get orgId() { return this.get('orgId') }
  get terms() { return this.get('terms') }
}

function createBucketControl(params: Partial<Bucket>) {
  const bucket = createBucket(params);
  return {
    currency: new FormControl(bucket.currency),
    contracts: FormList.factory(bucket.contracts, el => new BucketContractForm(el)),
    specificity: new FormControl(bucket.specificity),
    delivery: new FormControl(bucket.delivery)
  }
}

export type BucketControl = ReturnType<typeof createBucketControl>

export class BucketForm extends FormEntity<BucketControl> {
  constructor(bucket?: Partial<Bucket>) {
    super(createBucketControl(bucket))
  }

  get currency() { return this.get('currency') }
  get specificity() { return this.get('specificity') }
  get delivery() { return this.get('delivery') }
  get contracts() { return this.get('contracts') }

  get totalPrice() {
    if (!this.contracts.length) return 0;
    return this.contracts.value.reduce((sum, contract) => sum + contract.price, 0);}

  setAllValue(bucket: Partial<Bucket> = {}) {
    const controls = createBucketControl(bucket);
    for (const key in controls) {
      if (this.contains(key)) {
        const control = this.get(key as keyof BucketControl);
        const value = controls[key].value;
        if (control instanceof FormList) {
          control.patchAllValue(value);
        } else {
          control.patchValue(value);
        }
      } else {
        this.addControl(key, controls[key]);
      }
    }
  }
}