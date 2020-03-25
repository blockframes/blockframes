import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventListComponent } from './list.component';

import { EventModule } from '@blockframes/event';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [EventListComponent],
  imports: [
    CommonModule,
    EventModule,
    RouterModule.forChild([{ path: '', component: EventListComponent }])
  ]
})
export class EventListModule { }
