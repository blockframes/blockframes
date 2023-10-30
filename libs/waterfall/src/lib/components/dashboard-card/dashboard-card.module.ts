// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { DashboardCardComponent } from './dashboard-card.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [DashboardCardComponent],
  imports: [
    CommonModule,
    ImageModule,
    PricePerCurrencyModule,

    // Material
    MatIconModule,
  ],
  exports: [DashboardCardComponent]
})
export class DashboardCardModule { }
