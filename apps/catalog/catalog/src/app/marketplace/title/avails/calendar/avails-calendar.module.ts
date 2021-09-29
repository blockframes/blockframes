
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';


import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';


import { MapModule } from '@blockframes/ui/map';
import { OrgNameModule } from '@blockframes/organization/pipes';


import { MarketplaceMovieAvailsCalendarComponent } from './avails-calendar.component';
import { AvailsCalendarModule } from '@blockframes/contract/avails/calendar/calendar.module';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';


@NgModule({
  declarations: [ MarketplaceMovieAvailsCalendarComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    MapModule,
    OrgNameModule,
    AvailsFilterModule,
    AvailsCalendarModule,

    MatCardModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatDatepickerModule,

    RouterModule.forChild([{ path: '', component: MarketplaceMovieAvailsCalendarComponent }]),
  ],
  exports: [ MarketplaceMovieAvailsCalendarComponent ],
})
export class MarketplaceMovieAvailsCalendarModule {}
