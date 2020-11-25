import { NgModule, ChangeDetectionStrategy, Component, Input, PipeTransform, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { FormAutocompleteModule, matSelect } from '../../forms/autocomplete';
import { FormChipsAutocompleteModule, matMuliSelect } from '../../forms/chips-autocomplete';
import { TextFormModule, matText } from '../../forms/text';
import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';
import { Movie, MovieService } from '@blockframes/movie/+state';

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
    orgId: matSelect({ label: 'Org ID' }),
    movieIds: matMuliSelect({ label: 'Title IDS' })
  },
}

function getOrgQueryFn(app: string) {
  const accepted = ['status', '==', 'accepted'];
  const appAccess = [`appAccess.${app}.dashboard`, '==', true];
  return ref => ref.where(...accepted).where(...appAccess);
}

function getMoviesQueryFn(app: string, orgId: string) {
  const accepted = ['storeConfig.status', '==', 'accepted'];
  const appAccess = [`storeConfig.appAccess.${app}`, '==', true];
  const fromOrg = ['orgIds', 'array-contains', orgId];
  return ref => ref.where(...accepted).where(...appAccess).where(...fromOrg);
}

function toMap<T extends { id: string }>(list: T[]) {
  const record: Record<string, T> = {};
  for (const item of list) {
    record[item.id] = item;
  }
  return record;
}

type OrgTitleForm = FormEntity<typeof orgTitleSchema>;


@Component({
  selector: 'form-org-titles',
  templateUrl: './org-titles.component.html',
  styleUrls: ['./org-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent {
  @Input() form: OrgTitleForm;

  app$ = this.route.paramMap.pipe(
    map(params => params.get('app'))
  );
  
  displayOrgLabel = (org?: Organization) => orgName(org); 
  getOrgValue = (org?: Organization) => org?.id; 
  displayTitleLabel = (title?: Movie) => title?.title.international;
  getTitleValue = (title?: Movie) => title?.id;

  constructor(private route: ActivatedRoute) {}

  reset() {
    this.form.get('movieIds').clear();
  }
}


@Pipe({ name: 'getOrgs' })
export class GetOrgsPipe implements PipeTransform {
  constructor(private orgService: OrganizationService) {}
  async transform(app: string) {
    const queryFn = getOrgQueryFn(app);
    const orgs = await this.orgService.getValue(queryFn);
    return toMap(orgs);
  }
}

@Pipe({ name: 'getOrgId' })
export class GetOrgIdPipe implements PipeTransform {
  transform(form: OrgTitleForm, orgs: Record<string, Organization>) {
    return form.get('orgId').value$.pipe(
      map(orgId => orgId in orgs ? orgId : null)
    );
  }
}

@Pipe({ name: 'getOrgTitle' })
export class GetOrgTitlePipe implements PipeTransform {
  constructor(private titleService: MovieService){}
  transform(orgId: string, app: string) {
    if (!orgId) return;
    const queryFn = getMoviesQueryFn(app, orgId);
    return this.titleService.valueChanges(queryFn).pipe(
      map(toMap)
    );
  }
}



@NgModule({
  declarations: [OrgsComponent, GetOrgsPipe, GetOrgIdPipe, GetOrgTitlePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormAutocompleteModule,
    FormChipsAutocompleteModule,
    TextFormModule
  ]
})
export class OrgsModule { }
