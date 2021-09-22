// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Fritzschoff
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe'

// Component
import { UpcomingScreeningsComponent } from './upcoming-screenings.component';
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';

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
    RouterModule,
    OngoingButtonModule,

    // Material
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule
  ],
  exports: [UpcomingScreeningsComponent],
  declarations: [UpcomingScreeningsComponent],
})
export class UpcomingScreeningsModule { }