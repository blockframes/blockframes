import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Template, TemplateQuery, TemplateService } from '../+state';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MaterialService } from '../../material/+state';

@Component({
  selector: 'add-template-dialog',
  template: `
    <div mat-dialog-content>
      <h2>Add a new template</h2>
      <mat-form-field appearance="outline" fxLayoutAlign="center">
        <mat-label>File name</mat-label>
        <input #templateName matInput placeholder="New template name"/>
      </mat-form-field>
    </div>
    <div mat-dialog-actions fxLayoutAlign="center">
      <button mat-stroked-button color="primary" (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="addTemplate(templateName.value)">Create</button>
    </div>
  `
})
export class AddTemplateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddTemplateDialogComponent>,
    private service: TemplateService
  ) {
  }

  public addTemplate(templateName: string) {
    this.service.addTemplate(templateName);
    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }
}


@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateListComponent implements OnInit {
  public templates$: Observable<Template[]>;

  constructor(
    private service: TemplateService,
    private query: TemplateQuery,
    public dialog: MatDialog,
    private materialService: MaterialService
  ) {
  }

  ngOnInit() {
    this.service.subscribeOnOrganizationTemplates$.subscribe(); //todo unsubscribe
    this.materialService.subscribeOnOrganizationMaterials$.subscribe(); //todo unsubscribe

    this.templates$ = this.query.selectAll();
  }

  public addTemplateDialog(): void {
    this.dialog.open(AddTemplateDialogComponent, {
      width: '400px'
    });
  }

  public deleteTemplate(id: string) {
    this.service.deleteTemplate(id);
  }
}

