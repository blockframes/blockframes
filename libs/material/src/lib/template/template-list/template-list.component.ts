import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateQuery, TemplateService, TemplatesByOrgs } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MaterialService } from '../../material/+state';
import { AddTemplateComponent } from './add-template';
import { takeWhile } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit, OnDestroy {
  public templatesByOrgs$: Observable<TemplatesByOrgs>;
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

    this.templatesByOrgs$ = this.query.templatesByOrgs$;
  }

  public addTemplateDialog(orgName: string): void {
    const orgId = this.organizationQuery.getOrgId(orgName);
    this.dialog.open(AddTemplateComponent, {
      width: '400px',
      data: { orgId }
    });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
