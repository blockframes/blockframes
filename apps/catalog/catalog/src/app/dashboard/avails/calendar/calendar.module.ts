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
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';

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
