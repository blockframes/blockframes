import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TemplateQuery, TemplateService } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { MaterialService } from '../../material/+state';
import { AddTemplateComponent } from './add-template';
import { OrganizationQuery } from '@blockframes/organization';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit, OnDestroy {
  public templates$: Observable<any>;
  private isAlive = true;

  constructor(
    private service: TemplateService,
    private query: TemplateQuery,
    public dialog: MatDialog,
    private materialService: MaterialService,
    private organizationQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    this.service.subscribeOnAllOrgsTemplates$.pipe(takeWhile(() => this.isAlive)).subscribe();
    this.materialService.subscribeOnAllOrgsMaterials$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();

    this.templates$ = this.query.templatesByOrgs$;
  }

  public addTemplateDialog(orgId: string): void {
    this.dialog.open(
      AddTemplateComponent,
      {
        width: '400px',
        data: { orgId }
      }
    );
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
