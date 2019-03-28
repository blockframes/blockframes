import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatCardModule } from '@angular/material';
import { MaterialViewComponent } from './material-view/material-view.component';

@NgModule({
  declarations: [MaterialViewComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatCardModule,
  ],
})
export class MaterialModule { }
