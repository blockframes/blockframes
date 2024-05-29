import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ScreeningComponent } from './screening.component';

// Modules
import { EventListModule } from '@blockframes/event/components/list/list.module';
import { ScreeningItemModule } from '@blockframes/event/components/screening-item/screening-item.module';
import { EventEmptyModule } from '@blockframes/event/components/empty/empty.module';
import { UpcomingScreeningsModule } from '@blockframes/movie/components/upcoming-screenings/upcoming-screenings.module';

// Material 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ScreeningComponent],
  imports: [
    CommonModule,
    EventListModule,
    FlexLayoutModule,
    EventEmptyModule,
    ScreeningItemModule,
    UpcomingScreeningsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: ScreeningComponent }])
  ]
})
export class ScreeningModule { }
