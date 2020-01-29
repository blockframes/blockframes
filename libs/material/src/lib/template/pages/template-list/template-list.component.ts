import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TemplateAddComponent } from '../../components/template-add/template-add.component';
import { TemplateQuery } from '../../+state/template.query';
import { map } from 'rxjs/operators';
import { TemplateRaw } from '../../+state/template.model';

interface TemplateDateWithString extends TemplateRaw<string> {}

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'template-list';
  public templates$: Observable<TemplateDateWithString[]>;

  public versionColumns = {
    name: 'Title',
    created: 'Creation Date',
    updated: 'Last Modification'
  };
  public initialVersionColumns = ['name', 'created', 'updated'];

  constructor(
    private query: TemplateQuery,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.templates$ = this.query.selectAll().pipe(
      map(templates => templates.map(template => ({
        ...template,
        created: template.created.toDateString(),
        updated: template.updated.toDateString()
      })))
    );
  }

  public addTemplateDialog(): void {
    this.dialog.open(TemplateAddComponent);
  }
}
