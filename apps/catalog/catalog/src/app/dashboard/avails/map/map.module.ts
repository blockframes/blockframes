import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { MapModule } from '@blockframes/ui/map';
import { MaxLengthModule } from '@blockframes/utils/pipes';

// Component
import { DashboardAvailsMapComponent } from './map.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    DashboardAvailsMapComponent,
  ],
  imports: [
    CommonModule,
    MaxLengthModule,
    FlexLayoutModule,
    TableModule,
    AvailsFilterModule,
    MapModule,
    LogoSpinnerModule,

    //Material
    MatButtonModule,
    MatListModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: DashboardAvailsMapComponent }])
  ]
})
export class CatalogDashboardAvailsMapModule { }
