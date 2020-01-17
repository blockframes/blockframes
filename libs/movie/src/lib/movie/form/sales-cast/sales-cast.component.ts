import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { default as staticModels } from '@blockframes/utils/static-model/staticModels';
import { CreditForm, MovieSalesCastControl } from './sales-cast.form';

function getRole(role: keyof MovieSalesCastControl) {
  switch (role) {
    case 'cast': return 'CAST_ROLES';
    case 'crew': return 'CREW_ROLES';
    case 'producers': return 'PRODUCER_ROLES';
  }
}

@Component({
  selector: '[form][role] movie-form-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class MovieFormSalesCastComponent {
  roles: { slug: string, label: string }[] = [];

  @Input() form: FormList<CreditForm>;
  @Input() set role(role: keyof MovieSalesCastControl) {
    this.roles = staticModels[getRole(role)];
  }

  add() {
    this.form.push(new CreditForm())
  }

  public remove(i: number): void {
    this.form.removeAt(i);
  }

}
