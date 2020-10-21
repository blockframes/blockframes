import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Funding } from '../+state';

@Pipe({ name: 'totalFundings' })
export class TotalFundingsPipe implements PipeTransform {
  transform(fundings: Funding[]) {
    return fundings.reduce((sum, funding) => sum + funding.amount, 0);
  }
}

@NgModule({
  declarations: [TotalFundingsPipe],
  exports: [TotalFundingsPipe],
})
export class FundingsPipeModule {}
