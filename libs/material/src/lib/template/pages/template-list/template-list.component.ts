import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TemplateQuery, TemplateService, Template } from '../../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organization } from '@blockframes/organization';
import { TemplateAddComponent } from '../../components/template-add/template-add.component';

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
    private service: TemplateService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.hasTemplates$ = this.query.hasTemplates$;
    this.orgsWithTemplates$ = this.query.orgsWithTemplates$;
  }

  public deleteTemplate(template: Template) {
    this.service.deleteTemplate(template.id);
    this.snackBar.open(`Template "${template.name}" has been deleted.`, 'close', {
      duration: 2000
    });
  }

  public addTemplateDialog(event: MouseEvent, org: Organization): void {
    event.stopPropagation();
    this.dialog.open(TemplateAddComponent, {
      width: '400px',
      data: { org }
    });
  }
}
