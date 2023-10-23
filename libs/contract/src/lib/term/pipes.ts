import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Contract, WaterfallContract, BucketContract, BaseContract } from '@blockframes/model';
import { of } from 'rxjs';
import { TermService } from './service';

const isBucketContract = (contract: BaseContract | BucketContract): contract is BucketContract => {
  return 'terms' in contract;
}

@Pipe({ name: 'getTermsFromContract' })
export class GetTermsFromContract implements PipeTransform {

  constructor(private service: TermService) { }
  transform(contract?: Contract | BucketContract | WaterfallContract | null) {
    if (!contract) return of([]);
    if (isBucketContract(contract)) return of(contract.terms);
    return this.service.valueChanges(contract.termIds);
  }
}

@NgModule({
  exports: [GetTermsFromContract],
  declarations: [GetTermsFromContract]
})
export class TermPipeModule { }
