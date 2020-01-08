import { Component, Input } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: '[form] movie-form-production-companies',
  templateUrl: './production-companies.component.html',
  styleUrls: ['./production-companies.component.scss']
})
export class ProductionCompaniesComponent {
  @Input() form: FormArray;

  public add(event): void {
    const { value = '' } = event;
    this.form.push(new FormControl(value))
    console.log(this.form);
  }

  public remove(i: number): void {
    this.form.removeAt(i);
  }
}
