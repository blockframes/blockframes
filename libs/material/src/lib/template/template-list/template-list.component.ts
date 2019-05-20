import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TemplateQuery } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { Organization } from '@blockframes/organization';
import { TemplateAddComponent } from '../template-add/template-add.component';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  public orgsWithTemplates$: Observable<Organization[]>;
  public hasTemplates$: Observable<boolean>;

  constructor(
    private query: TemplateQuery,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.hasTemplates$ = this.query.hasTemplates$;
    this.orgsWithTemplates$ = this.query.orgsWithTemplates$;
  }

  public addTemplateDialog(event: MouseEvent, org: Organization): void {
    event.stopPropagation();
    this.dialog.open(TemplateAddComponent, {
      width: '400px',
      data: { org }
    });
  }
}
