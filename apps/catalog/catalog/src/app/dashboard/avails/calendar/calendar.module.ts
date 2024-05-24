import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Component
import { DashboardAvailsCalendarComponent } from './calendar.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { AvailsCalendarModule } from '@blockframes/contract/avails/calendar/calendar.module';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    DashboardAvailsCalendarComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    AvailsFilterModule,
    AvailsCalendarModule,
    LogoSpinnerModule,

    //Material
    MatButtonModule,
    MatListModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: DashboardAvailsCalendarComponent }])
  ]
})
export class CatalogDashboardAvailsCalendarModule { }
