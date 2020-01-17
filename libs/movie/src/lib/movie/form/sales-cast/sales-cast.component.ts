import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormArray } from '@angular/forms';
import { default as staticModels } from '../../static-model/staticModels';
import { CreditForm } from './sales-cast.form';

@Component({
  selector: '[form] movie-form-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class MovieFormSalesCastComponent {
  @Input() form: FormArray;
  roles = staticModels.CAST_ROLES;

  add() {
    this.form.push(new CreditForm())
  }

  public remove(i: number): void {
    this.form.removeAt(i);
  }

}
