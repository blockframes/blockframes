import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { Perk } from "../+state";

@Pipe({ name: 'isUnlimited' })
export class IsUnlimitedPipe implements PipeTransform  {
  transform(amount: Perk['amount']) {
    return amount.total === Infinity;
  }
}

@NgModule({
  declarations: [IsUnlimitedPipe],
  exports: [IsUnlimitedPipe]
})
export class PerksPipeModule {}