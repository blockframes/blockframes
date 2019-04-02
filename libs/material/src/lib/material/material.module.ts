import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatCardModule, MatIconModule } from '@angular/material';
import { MaterialViewComponent } from './material-view/material-view.component';
import { MaterialFormComponent } from './material-form/material-form.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MaterialViewComponent, MaterialFormComponent],
  exports: [MaterialViewComponent, MaterialFormComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
})
export class MaterialModule { }
