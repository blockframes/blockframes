import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TextFormModule, matText } from '../../forms/text';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { FormAutocompleteModule, matMuliSelect } from '../../forms/autocomplete';
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
  options$ = this.route.paramMap.pipe(
    map(params => getQueryFn(params.get('app'))),
    switchMap(queryFn => this.service.valueChanges(queryFn)),
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
    FormAutocompleteModule,
    TextFormModule,
  ]
})
export class OrgsModule { }
