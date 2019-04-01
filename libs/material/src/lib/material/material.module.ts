import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatCardModule } from '@angular/material';
import { MaterialViewComponent } from './material-view/material-view.component';
import { MaterialFormComponent } from './material-form/material-form.component';

@NgModule({
  declarations: [MaterialViewComponent, MaterialFormComponent],
  exports: [MaterialViewComponent, MaterialFormComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatCardModule,
  ],
})
export class MaterialModule { }
