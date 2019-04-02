import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatCardModule, MatIconModule, MatListModule, MatInputModule, MatButtonModule } from '@angular/material';
import { MaterialItemComponent } from './material-item/material-item.component';
import { MaterialFormComponent } from './material-form/material-form.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [MaterialItemComponent, MaterialFormComponent, MaterialListComponent,],
  exports: [MaterialItemComponent, MaterialFormComponent, MaterialListComponent,],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
  ],
})
export class MaterialModule { }
