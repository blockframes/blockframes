import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { FormAutocompleteModule, matSelect } from '../../forms/autocomplete';
import { TextFormModule, matText } from '../../forms/text';
import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { map, switchMap } from 'rxjs/operators';

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
    orgId: matSelect<string>({ label: 'Org ID' }),
    movieIds: {
      form: 'array',
      controls: [],
      factory: () => ({ form: 'control' })
    }
  },
}

function getOrgQueryFn(app: string) {
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


@Component({
  selector: 'form-org-titles',
  templateUrl: './org-titles.component.html',
  styleUrls: ['./org-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent {
  @Input() form?: FormEntity<typeof orgTitleSchema>;
  displayOrgLabel = (org?: Organization) => orgName(org); 
  options$ = this.route.paramMap.pipe(
    map(params => getOrgQueryFn(params.get('app'))),
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
    FormAutocompleteModule,
    TextFormModule
  ]
})
export class OrgsModule { }
