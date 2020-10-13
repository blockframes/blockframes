import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormProductionComponent {
  form = this.shell.getForm('movie');

  constructor(private shell: MovieFormShellComponent) { }

  get internationalSales() {
    return this.form.stakeholders.get('salesAgent');
  }

  get distributors() {
    return this.form.stakeholders.get('distributor');
  }

  get coProductionCompany() {
    return this.form.stakeholders.get('coProductionCompany');
  }

  get productionCompany() {
    return this.form.stakeholders.get('productionCompany');
  }

}
