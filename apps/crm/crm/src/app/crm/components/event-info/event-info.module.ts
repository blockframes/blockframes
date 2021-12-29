import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatCardModule } from '@angular/material/card';
import { GuestTableModule } from '../guest-table/guest-table.module';
import { MatIconModule } from '@angular/material/icon';

// Modules
import { EventRangeModule } from '@blockframes/event/pipes/event-range.pipe';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { GoToModule } from '../go-to/go-to.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { MatButtonModule } from '@angular/material/button';

// Components 
import { EventInfoComponent } from './event-info.component';

@NgModule({
  declarations: [EventInfoComponent],
  exports: [EventInfoComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    EventRangeModule,
    GuestTableModule,
    GoToModule,
    // Material
    MatCardModule,
    OrgNameModule,
    MatIconModule,
    MatButtonModule,
    ToLabelModule
  ]
})
export class EventInfoModule { }
