import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TextFormModule, matText } from '../../forms/text';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { FormChipsAutocompleteModule, matMuliSelect } from '../../forms/chips-autocomplete';
import { Section } from '../../template/template.model';
import { map, switchMap } from 'rxjs/operators';

interface OrgQueryParams {
  facets: string[];
}

interface OrgsSection extends Section {
  title: string;
  query: OrgQueryParams;
  orgIds: string[];
}

function getQueryFn(app: string) {
  const accepted = ['status', '==', 'accepted'];
  const appAccess = [`appAccess.${app}.dashboard`, '==', true];
  return ref => ref.where(...accepted).where(...appAccess);
}

function toMap(orgs: Organization[]) {
  const record: Record<string, Organization> = {};
  for (const org of orgs) {
    record[org.id] = org;
  }
  return record;
}


export const orgsSchema: FormGroupSchema<OrgsSection> = {
  form: 'group',
  load: async () => import('./orgs.component').then(m => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    orgIds: matMuliSelect<string>({ label: 'Org IDs' }),
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

  options$ = this.route.paramMap.pipe(
    map(params => getQueryFn(params.get('app'))),
    switchMap(queryFn => this.service.valueChanges(queryFn)),
    map(toMap)
  );

  constructor(
    private service: OrganizationService,
    private route: ActivatedRoute
  ) {}
}




@NgModule({
  declarations: [OrgsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormChipsAutocompleteModule,
    TextFormModule,
  ]
})
export class OrgsModule { }
