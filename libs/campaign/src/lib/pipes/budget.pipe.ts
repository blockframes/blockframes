import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budget } from '../+state';

@Pipe({ name: 'budget' })
export class BudgetPipe implements PipeTransform {
  transform(budget: Budget): number {
    const { development, shooting, postProduction, administration, contingency } = budget;
    return [development, shooting, postProduction, administration, contingency]
      .reduce((sum, value) => value ? sum + value : sum, 0);
  }
}


@NgModule({
  declarations: [BudgetPipe],
  imports: [CommonModule],
  exports: [BudgetPipe]
})
export class BudgetPipeModule { }
