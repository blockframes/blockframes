import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ProductionCompagnyForm } from '../main.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { Company } from "@blockframes/utils/common-interfaces/identity";
@Component({
  selector: '[form] movie-form-production-companies',
  templateUrl: './production-companies.component.html',
  styleUrls: ['./production-companies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionCompaniesComponent {
  @Input() form: FormList<Company>;

  public add(): void {
    this.form.push(new ProductionCompagnyForm());
  }

  public remove(i: number): void {
    this.form.removeAt(i);
  }
}
