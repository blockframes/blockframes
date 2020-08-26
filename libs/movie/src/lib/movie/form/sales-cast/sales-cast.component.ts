import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { CreditForm } from './sales-cast.form';

@Component({
  selector: '[form] [role] movie-form-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MovieFormSalesCastComponent {

  @Input() form: FormList<CreditForm>;
  @Input() roleLabel: string;

  @Input() role: 'CREW_ROLES' | 'CAST_ROLES' | 'PRODUCER_ROLES' | 'STAKEHOLDER_ROLES' | 'SUB_LICENSOR_ROLES' | 'LEGAL_ROLES'

  add() {
    this.form.add(new CreditForm())
  }

  public remove(i: number) {
    this.form.removeAt(i);
  }

}
