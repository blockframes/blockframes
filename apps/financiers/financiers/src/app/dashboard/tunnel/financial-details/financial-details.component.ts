import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { TunnelStep } from '@blockframes/ui/tunnel';

const steps: TunnelStep = {
  title: 'Financing Conditions',
  icon: 'CAD',
  time: 1,
  routes: [
    { path: 'financial-details', label: 'Financial Details' }
  ],
}


@Component({
  selector: 'financiers-form-financial-details',
  templateUrl: './financial-details.component.html',
  styleUrls: ['./financial-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormFinancialDetailsComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) { }

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
}
