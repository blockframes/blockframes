import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatCardModule, MatIconModule, MatListModule } from '@angular/material';
import { MaterialViewComponent } from './material-view/material-view.component';
import { MaterialFormComponent } from './material-form/material-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryListComponent } from '../template/category-list/category-list.component';

@NgModule({
  declarations: [MaterialViewComponent, MaterialFormComponent, CategoryListComponent],
  exports: [MaterialViewComponent, MaterialFormComponent, CategoryListComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    MatListModule,
    MatFormFieldModule,
  ],
})
export class MaterialModule { }
