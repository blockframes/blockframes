import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { RunningTimeFilterComponent } from './running-time.component';

// Material
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [RunningTimeFilterComponent],
  exports: [RunningTimeFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Material
    MatRadioModule
  ],
})
export class RunningTimeFilterModule { }
