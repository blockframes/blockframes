import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { of } from "rxjs";
import { BucketContract } from "../bucket/+state";
import { TermService } from "../term/+state";
import { Contract } from "../contract/+state";

const isBucketContract = (contract: Contract | BucketContract): contract is BucketContract => {
  return 'terms' in contract;
}

@Pipe({ name: 'getTermsFromContract' })
export class GetTermsFromContract implements PipeTransform {

  constructor(private service: TermService) { }
  transform(contract?: Contract | BucketContract | null) {
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
