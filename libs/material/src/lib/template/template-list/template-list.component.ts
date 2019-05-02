import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateQuery } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MaterialService } from '../../material/+state';

import { takeWhile } from 'rxjs/operators';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { TemplateAddComponent } from '../template-add/template-add.component';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit, OnDestroy {
  public orgsWithTemplates$: Observable<Organization[]>;
  public hasTemplates$: Observable<boolean>;
  private isAlive = true;

  constructor(
    private query: TemplateQuery,
    public dialog: MatDialog,
    private materialService: MaterialService,
    private organizationQuery: OrganizationQuery,
  ) {}

  ngOnInit() {
    this.materialService.subscribeOnAllOrgsMaterials$()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();

    this.hasTemplates$ = this.query.hasTemplates$;
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
