import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormProductionComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) { }

  get internationalSales() {
    return this.stakeholders.get('salesAgent');
  }

  get distributors() {
    return this.stakeholders.get('distributor');
  }

  get coProducer() {
    return this.stakeholders.get('coProducer');
  }

  get executiveProducer() {
    return this.stakeholders.get('executiveProducer');
  }

  get producers() {
    return this.form.get('producers');
  }

  get stakeholders() {
    return this.form.get('stakeholders');
  }

}
