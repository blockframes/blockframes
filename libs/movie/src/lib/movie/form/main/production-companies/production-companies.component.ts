import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  addForm = new FormControl();
  isEditing : number;

  public add(): void {
    const displayName = this.addForm.value;
    if (typeof this.isEditing === 'number') {
      this.form.at(this.isEditing).patchValue( {displayName});
      delete this.isEditing;
    } else {
      this.form.push(new ProductionCompagnyForm({ displayName }));
    }
    this.addForm.reset();
  }

  public edit(i: number): void {
    const value = this.form.at(i).get('displayName').value;
    this.addForm.patchValue(value);
    this.isEditing = i;
  }

  public remove(i: number): void {
    this.form.removeAt(i);
  }
}
