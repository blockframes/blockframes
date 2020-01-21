import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
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
}
