import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';


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

  getTotalEstimatedBudget() {
    const total = this.totalBudget.get('producerFees').value
    + this.totalBudget.get('castCost').value
    + this.totalBudget.get('shootCost').value
    + this.totalBudget.get('postProdCost').value
    + this.totalBudget.get('others').value;

    return total;
  }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.financialDetails/`;
  }
}
