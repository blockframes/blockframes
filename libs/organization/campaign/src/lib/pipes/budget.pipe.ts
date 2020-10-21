import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budget } from '../+state';

@Pipe({ name: 'budget' })
export class BudgetPipe implements PipeTransform {
  transform(budget: Budget): number {
    const { castCost, others, postProdCost, producerFees, shootCost } = budget;
    return castCost + others + postProdCost + producerFees + shootCost;
  }
}


@NgModule({
  declarations: [BudgetPipe],
  imports: [CommonModule],
  exports: [BudgetPipe]
})
export class BudgetPipeModule { }
