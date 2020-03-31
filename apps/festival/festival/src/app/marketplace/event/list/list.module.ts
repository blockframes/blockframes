import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventListComponent } from './list.component';

import { EventModule } from '@blockframes/event/event.module';
import { RouterModule } from '@angular/router';
import { AppNavModule } from '@blockframes/ui/app-nav';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module'

// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [EventListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventModule,
    AppNavModule,
    ImageReferenceModule,
    DisplayNameModule,
    // Material
    MatIconModule,
    // Router
    RouterModule.forChild([{ path: '', component: EventListComponent }])
  ]
})
export class EventListModule { }
