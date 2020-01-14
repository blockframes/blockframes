import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { StakeholdersForm } from '../main.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { Stakeholder } from "@blockframes/utils/common-interfaces/identity";
@Component({
  selector: '[form] movie-form-stakeholders',
  templateUrl: './stakeholders.component.html',
  styleUrls: ['./stakeholders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StakeholdersComponent {
  @Input() form: FormList<Stakeholder>;

  public add(): void {
    this.form.push(new StakeholdersForm());
  }

  public remove(i: number): void {
    this.form.removeAt(i);
  }
}
