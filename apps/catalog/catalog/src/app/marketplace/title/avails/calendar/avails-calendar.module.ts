
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { MapModule } from '@blockframes/ui/map';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { AvailsCalendarModule } from '@blockframes/contract/avails/calendar/calendar.module';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';

// Component
import { MarketplaceMovieAvailsCalendarComponent } from './avails-calendar.component';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [ MarketplaceMovieAvailsCalendarComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    MapModule,
    AvailsFilterModule,
    AvailsCalendarModule,
    LogoSpinnerModule,

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
