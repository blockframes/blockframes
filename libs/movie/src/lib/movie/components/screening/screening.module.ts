// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Fritzschoff
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe'

// Component
import { ScreeningComponent } from './screening.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    EventRangeModule,

    // Material
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule
  ],
  exports: [ScreeningComponent],
  declarations: [ScreeningComponent],
  providers: [],
})
export class ScreeningModule { }
