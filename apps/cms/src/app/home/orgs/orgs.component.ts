import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Organization, orgName } from '@blockframes/organization/+state';
import { TextFormModule, matText } from '../../forms/text';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { matMultiSelect } from '../../forms/select';
import { Section } from '../../template/template.model';
import { HomePipesModule } from '../pipes';

interface OrgQueryParams {
  facets: string[];
}

interface OrgsSection extends Section {
  title: string;
  query: OrgQueryParams;
  orgIds: string[];
}

export const orgsSchema: FormGroupSchema<OrgsSection> = {
  form: 'group',
  load: async () => import('./orgs.component').then(m => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    orgIds: matMultiSelect<string>({ label: 'Org IDs' }),
    query: { form: 'group', controls: {} },
  },
}

@Component({
  selector: 'form-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent {
  @Input() form?: FormEntity<typeof orgsSchema>;
  displayLabel = (org?: Organization) => orgName(org);
  getValue = (org?: Organization) => org?.id;

  params$ = this.route.paramMap;

  constructor(private route: ActivatedRoute) {}
}




@NgModule({
  declarations: [OrgsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormChipsAutocompleteModule,
    TextFormModule,
    HomePipesModule,
  ]
})
export class OrgsModule { }
