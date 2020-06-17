import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { GuestTableModule } from '../guest-table/guest-table.module';
import { MatIconModule } from '@angular/material/icon';

// Modules
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';

// Components 
import { EventInfoComponent } from './event-info.component';

@NgModule({
  declarations: [EventInfoComponent],
  exports: [EventInfoComponent],
  imports: [
    CommonModule,
    RouterModule,
    EventRangeModule,
    GuestTableModule,
    // Material
    MatCardModule,
    OrgNameModule,
    MatIconModule,
  ]
})
export class EventInfoModule { }
