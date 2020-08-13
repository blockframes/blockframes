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

  public productionColumns = {
    displayName: 'Company Name',
    countries: 'Production Country'
  }

  public coProductionColumns = {
    displayName: 'Company Name',
    countries: 'Co-Production Country'
  }

  public producerColumns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    role: 'Role'
  }

  public distributorColumns = {
    displayName: 'Display Name',
    countries: 'Countries',
  }

  public salesColumns = {
    displayName: 'Company Name',
    countries: "Sales Company's Nationality"
  }

  constructor(private shell: MovieFormShellComponent) { }

  get internationalSales() {
    return this.stakeholders.get('salesAgent');
  }

  get distributors() {
    return this.stakeholders.get('distributor');
  }

  get coProductionCompany() {
    return this.stakeholders.get('coProductionCompany');
  }

  get productionCompany() {
    return this.stakeholders.get('productionCompany');
  }

  get producers() {
    return this.form.get('producers');
  }

  get stakeholders() {
    return this.form.get('stakeholders');
  }

}
