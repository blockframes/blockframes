import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateQuery, TemplateService, TemplatesByOrgs } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MaterialService } from '../../material/+state';
import { AddTemplateComponent } from './add-template';
import { takeWhile, tap } from 'rxjs/operators';
import { OrganizationQuery, Organization } from '@blockframes/organization';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit, OnDestroy {
  public orgsWithTemplates$: Observable<Organization[]>;
  private isAlive = true;

  constructor(
    private service: TemplateService,
    private query: TemplateQuery,
    public dialog: MatDialog,
    private materialService: MaterialService,
    private organizationQuery: OrganizationQuery,
  ) {}

  ngOnInit() {
    this.service.subscribeOnAllOrgsTemplates$().pipe(takeWhile(() => this.isAlive)).subscribe();
    this.materialService.subscribeOnAllOrgsMaterials$()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();

    this.orgsWithTemplates$ = this.query.orgsWithTemplates$;
  }

  public addTemplateDialog(event: MouseEvent, orgName: string): void {
    event.stopPropagation();
    const orgId = this.organizationQuery.getOrgId(orgName);
    this.dialog.open(TemplateAddComponent, {
      width: '400px',
      data: { orgId }
    });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
