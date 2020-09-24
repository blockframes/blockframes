import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TotalBudgetForm } from '@blockframes/movie/form/movie.form';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';


@Component({
  selector: 'financiers-form-financial-details',
  templateUrl: './financial-details.component.html',
  styleUrls: ['./financial-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFinancialDetailsComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  get totalBudget() {
    return this.form.get('totalBudget');
  }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.financialDetails/`;
  }
}


@Pipe({ name: 'budget' })
export class BudgetPipe implements PipeTransform {
  transform(budget: TotalBudgetForm): Observable<number> {
    return budget.valueChanges.pipe(
      startWith(budget.value),
      map(({ castCost, others, postProdCost, producerFees, shootCost }) => castCost + others + postProdCost + producerFees + shootCost)
    );
  }
}
