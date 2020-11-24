import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../page/page.model';

interface OrgQuery {}

interface Orgs extends Section {
  title: string;
  query: OrgQuery;
}

export const orgsSchema: FormGroupSchema<Orgs> = {
  form: 'group',
  load: async () => import('./orgs.component').then(m => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    query: { form: 'group', controls: {} },
  },
}

@Component({
  selector: 'builder-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent {
  @Input() form?: FormEntity<typeof orgsSchema>;
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextFormModule, matText } from '../text';


@NgModule({
  declarations: [OrgsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFormModule,
  ]
})
export class OrgsModule { }
