// Angular
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Pages
import { SalesMapComponent } from './sales-map.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { MapModule } from '@blockframes/ui/map';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [SalesMapComponent],
  imports: [
    BfCommonModule,
    RouterModule,
    LogoSpinnerModule,
    FlexLayoutModule,
    MapModule,
    PricePerCurrencyModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,

  ],
  exports: [SalesMapComponent]
})
export class SalesMapModule { }
