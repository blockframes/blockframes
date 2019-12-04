import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateAddComponent } from '../../components/template-add/template-add.component';
import { Template } from '../../+state/template.model';
import { TemplateQuery } from '../../+state/template.query';
import { TemplateService } from '../../+state/template.service';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'template-list';
  public templates$: Observable<Template[]>;

  constructor(
    private query: TemplateQuery,
    public dialog: MatDialog,
    private service: TemplateService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.templates$ = this.query.selectAll();
  }

  public deleteTemplate(template: Template) {
    this.service.remove(template.id);
    this.snackBar.open(`Template "${template.name}" has been deleted.`, 'close', {
      duration: 2000
    });
  }

  public addTemplateDialog(): void {
    this.dialog.open(TemplateAddComponent);
  }
}
