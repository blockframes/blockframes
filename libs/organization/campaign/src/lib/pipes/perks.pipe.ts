import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { formatCurrency } from '@angular/common';
import { Perk } from "../+state";

@Pipe({ name: 'isUnlimited' })
export class IsUnlimitedPipe implements PipeTransform {
  transform(amount: Perk['amount']) {
    return amount.total === Infinity;
  }
}

@Pipe({ name: 'minPledge' })
export class MinPledgePipe implements PipeTransform {
  transform(minPledge: Perk['minPledge']) {
    return minPledge
      ? `from ${formatCurrency(minPledge, 'en', '$', 'USD')}`
      : 'for any investment';
  }
}

@NgModule({
  declarations: [MinPledgePipe, IsUnlimitedPipe],
  exports: [MinPledgePipe, IsUnlimitedPipe]
})
export class PerksPipeModule { }