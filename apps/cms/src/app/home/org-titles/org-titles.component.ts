import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';


interface OrgTitle extends Section {
  title: string;
  description: string;
  orgId: string;
  movieIds: string[];
}

export const orgTitleSchema: FormGroupSchema<OrgTitle> = {
  form: 'group',
  load: async () => import('./org-titles.component').then(m => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    description: matText({ label: 'description' }),
    orgId: { form: 'control' },
    movieIds: {
      form: 'array',
      controls: [],
      factory: () => ({ form: 'control' })
    }
  },
}

@Component({
  selector: 'form-org-titles',
  templateUrl: './org-titles.component.html',
  styleUrls: ['./org-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent {
  @Input() form?: FormEntity<typeof orgTitleSchema>;
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextFormModule, matText } from '../../forms/text';


@NgModule({
  declarations: [OrgsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFormModule
  ]
})
export class OrgsModule { }
