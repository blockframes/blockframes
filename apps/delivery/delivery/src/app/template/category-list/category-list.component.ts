import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Material, MaterialService, MaterialStore } from '../../material/+state';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'add-category-dialog',
  template: `
    <div mat-dialog-content>
      <h2>Add a new category</h2>
      <mat-form-field appearance="outline" fxLayoutAlign="center">
        <mat-label>File name</mat-label>
        <input #category matInput placeholder="New category name"/>
      </mat-form-field>
    </div>
    <div mat-dialog-actions fxLayoutAlign="center">
      <button mat-stroked-button color="primary" (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="addCategory(category.value)">Create</button>
    </div>
  `
})
export class AddCategoryDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    private service: MaterialService
  ) {
  }

  public addCategory(category: string) {
    this.service.addMaterial(category);
    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListComponent {

  @Input() template;

  constructor(
    private materialStore: MaterialStore,
    public dialog: MatDialog
  ) {
  }

  public selectCategory(materials: Material[]) {
    const materialsIds = [];
    for (const material of materials) {
      materialsIds.push(material.id);
    }
    this.materialStore.setActive(materialsIds);
  }


  public addCategory(): void {
    this.dialog.open(AddCategoryDialogComponent, {
      width: '400px'
    });
  }
}

