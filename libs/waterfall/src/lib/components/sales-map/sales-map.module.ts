// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { SalesMapComponent } from './sales-map.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { MapModule } from '@blockframes/ui/map';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [SalesMapComponent],
  imports: [
    CommonModule,
    LogoSpinnerModule,
    FlexLayoutModule,
    MapModule,
    ToLabelModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    MaxLengthModule,
    PricePerCurrencyModule,

    // Material
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,

  ],
  exports: [SalesMapComponent]
})
export class SalesMapModule { }
