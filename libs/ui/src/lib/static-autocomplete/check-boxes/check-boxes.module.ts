import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { StaticCheckBoxesComponent } from './check-boxes.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatListModule} from '@angular/material/list';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  declarations: [
    StaticCheckBoxesComponent,
  ],
  exports: [
    StaticCheckBoxesComponent,
  ],
})
export class StaticCheckBoxesModule { }
