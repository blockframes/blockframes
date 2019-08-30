import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TemplateQuery, TemplateService, Template } from '../../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateAddComponent } from '../../components/template-add/template-add.component';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  public loading$: Observable<boolean>;
  public templates$: Observable<Template[]>;

  public columnsToDisplay = [ 'template-name', 'date', 'delete'];
  public dataSource: MatTableDataSource<Template>;
  public selection = new SelectionModel<Template>(true, []);


  constructor(
    private query: TemplateQuery,
    public dialog: MatDialog,
    private service: TemplateService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loading$ = this.query.selectLoading();
    this.templates$ = this.query.selectAll();
    this.dataSource = new MatTableDataSource([]);
  }

  public deleteTemplate(template: Template) {
    this.service.deleteTemplate(template.id);
    this.snackBar.open(`Template "${template.name}" has been deleted.`, 'close', {
      duration: 2000
    });
  }

  public addTemplateDialog(): void {
    this.dialog.open(TemplateAddComponent, {
      width: '400px'
    });
  }
}
