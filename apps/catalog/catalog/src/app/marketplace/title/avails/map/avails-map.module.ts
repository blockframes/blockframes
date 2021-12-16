
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
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { MapModule } from '@blockframes/ui/map';
import { OrgNameModule } from '@blockframes/organization/pipes';


import { MarketplaceMovieAvailsMapComponent } from './avails-map.component';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';


@NgModule({
  declarations: [ MarketplaceMovieAvailsMapComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    MapModule,
    OrgNameModule,
    AvailsFilterModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,

    RouterModule.forChild([{ path: '', component: MarketplaceMovieAvailsMapComponent }]),
  ],
  exports: [ MarketplaceMovieAvailsMapComponent ],
})
export class MarketplaceMovieAvailsMapModule {}
