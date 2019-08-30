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

  columnsToDisplay = ['checkBox', 'template-name', 'date', 'delete'];
  dataSource: MatTableDataSource<Template>;
  selection = new SelectionModel<Template>(true, []);


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

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
      return this.selection.selected.length === this.dataSource.data.length;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
      this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
    }

    /** The label for the checkbox on the passed row */
    toggle(element: Template) {
      this.selection.toggle(element);
    }
}
