import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TotalBudgetForm } from '@blockframes/movie/form/movie.form';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Pipe({ name: 'budget' })
export class BudgetPipe implements PipeTransform {
  transform(budget: TotalBudgetForm): Observable<number> {
    return budget.valueChanges.pipe(
      startWith(budget.value),
      map(({ castCost, others, postProdCost, producerFees, shootCost }) => castCost + others + postProdCost + producerFees + shootCost)
    );
  }
}


@NgModule({
  declarations: [BudgetPipe],
  imports: [CommonModule],
  exports: [BudgetPipe]
})
export class BudgetPipeModule { }
