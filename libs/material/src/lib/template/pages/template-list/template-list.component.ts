import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TemplateAddComponent } from '../../components/template-add/template-add.component';
import { TemplateQuery } from '../../+state/template.query';
import { Template } from '../../+state/template.model';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'template-list';
  public templates$: Observable<Template[]>;

  public versionColumns = {
    name: 'Title',
    created: 'Creation Date',
    updated: 'Last Modification',
    id: 'Link'
  };
  public initialVersionColumns = ['name', 'created', 'updated'];

  constructor(
    private query: TemplateQuery,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.templates$ = this.query.selectAll();
  }

  public addTemplateDialog(): void {
    this.dialog.open(TemplateAddComponent);
  }
}
